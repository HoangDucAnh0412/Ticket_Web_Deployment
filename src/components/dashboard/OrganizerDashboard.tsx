import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  FaTicketAlt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaMapMarkerAlt,
  FaEye,
} from "react-icons/fa";
import { BASE_URL } from "../../utils/const";
import EventAnalysisStats from "./EventAnalysisStats";

interface TicketStats {
  totalTickets: number;
  soldTickets: number;
  usedTickets: number;
  cancelledTickets: number;
  totalRevenue: number;
}

interface TransactionStats {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
  pendingRevenue: number;
}

interface EventSales {
  eventId: number;
  eventName: string;
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  totalRevenue: number;
  areas: AreaSales[];
  phases: PhaseSales[];
}

interface AreaSales {
  areaId: number;
  areaName: string;
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  price: number;
}

interface PhaseSales {
  phaseId: number;
  startTime: string;
  endTime: string;
  soldTickets: number;
  revenue: number;
}

interface Event {
  eventId: number;
  name: string;
  date: string;
  status: string;
  totalTickets?: number;
  soldTickets?: number;
}

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const OrganizerDashboard: React.FC = () => {
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [transactionStats, setTransactionStats] =
    useState<TransactionStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventSales, setSelectedEventSales] =
    useState<EventSales | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      // Fetch parallel data
      const [ticketStatsRes, transactionStatsRes, eventsRes] =
        await Promise.all([
          fetch(`${BASE_URL}/api/organizer/tickets/stats`, { headers }),
          fetch(`${BASE_URL}/api/organizer/transactions/stats`, { headers }),
          fetch(`${BASE_URL}/api/organizer/events`, { headers }),
        ]);

      // Check if requests were successful
      if (!ticketStatsRes.ok) {
        console.error(
          "Ticket stats request failed:",
          ticketStatsRes.status,
          ticketStatsRes.statusText
        );
      }
      if (!transactionStatsRes.ok) {
        console.error(
          "Transaction stats request failed:",
          transactionStatsRes.status,
          transactionStatsRes.statusText
        );
      }
      if (!eventsRes.ok) {
        console.error(
          "Events request failed:",
          eventsRes.status,
          eventsRes.statusText
        );
      }

      const [ticketData, transactionData, eventsData] = await Promise.all([
        ticketStatsRes.json(),
        transactionStatsRes.json(),
        eventsRes.json(),
      ]);

      // Check if the response has the expected structure
      if (ticketData && ticketData.status === "success" && ticketData.data) {
        setTicketStats(ticketData.data);
      } else {
        console.error("Invalid ticket stats response:", ticketData);
        setTicketStats(null);
      }

      if (
        transactionData &&
        transactionData.status === "success" &&
        transactionData.data
      ) {
        setTransactionStats(transactionData.data);
      } else {
        console.error("Invalid transaction stats response:", transactionData);
        setTransactionStats(null);
      }

      setEvents(eventsData || []);

      // Fetch sales data for first event if available
      if (eventsData && eventsData.length > 0) {
        fetchEventSales(eventsData[0].eventId);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventSales = async (eventId: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${BASE_URL}/api/organizer/tickets/events/${eventId}/sales`,
        { headers }
      );
      const data = await response.json();
      setSelectedEventSales(data.data);
    } catch (error) {
      console.error("Error fetching event sales:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Prepare data for charts
  const ticketChartData = ticketStats
    ? [
        { name: "Sold", value: ticketStats.soldTickets, color: "#10B981" },
        { name: "Used", value: ticketStats.usedTickets, color: "#3B82F6" },
        {
          name: "Cancelled",
          value: ticketStats.cancelledTickets,
          color: "#EF4444",
        },
        {
          name: "Remaining",
          value:
            ticketStats.totalTickets -
            ticketStats.soldTickets -
            ticketStats.usedTickets -
            ticketStats.cancelledTickets,
          color: "#F59E0B",
        },
      ]
    : [];

  const transactionChartData = transactionStats
    ? [
        { name: "Completed", value: transactionStats.completedTransactions },
        { name: "Pending", value: transactionStats.pendingTransactions },
        { name: "Failed", value: transactionStats.failedTransactions },
      ]
    : [];

  const areaChartData =
    selectedEventSales?.areas?.map((area) => ({
      name: area.areaName,
      sold: area.soldTickets,
      available: area.availableTickets,
      total: area.totalTickets,
      price: area.price,
    })) || [];

  const phaseChartData =
    selectedEventSales?.phases?.map((phase) => ({
      name: `Phase ${phase.phaseId}`,
      sold: phase.soldTickets,
      revenue: phase.revenue,
      startTime: formatDate(phase.startTime),
      endTime: formatDate(phase.endTime),
    })) || [];

  const upcomingEvents = events
    .filter(
      (event) =>
        event.date &&
        new Date(event.date) > new Date() &&
        event.status === "approved"
    )
    .slice(0, 5);

  const activeEvents = events.filter(
    (event) => event.status === "approved"
  ).length;

  const totalEvents = events.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Organizer
        </h1>
        <p className="text-gray-600 mt-2">
          Total event and ticket sales for you
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaTicketAlt size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Tickets
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {ticketStats ? formatNumber(ticketStats.totalTickets) : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaMoneyBillWave size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Revenue
              </h3>
              <p className="text-2xl font-bold text-yellow-600">
                {ticketStats ? formatCurrency(ticketStats.totalRevenue) : "0 ₫"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaExchangeAlt size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transactions
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {transactionStats
                  ? formatNumber(transactionStats.totalTransactions)
                  : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaCalendarAlt size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Events</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(totalEvents)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <FaEye size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Active Events
              </h3>
              <p className="text-2xl font-bold text-indigo-600">
                {formatNumber(activeEvents)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
              <FaClock size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h3>
              <p className="text-2xl font-bold text-pink-600">
                {formatNumber(upcomingEvents.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FaChartLine size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ticket Sales Ratio
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {ticketStats && ticketStats.totalTickets > 0
                  ? `${(
                      (ticketStats.soldTickets / ticketStats.totalTickets) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      {events.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaClock className="text-blue-500 mr-2" />
            Select an event for detailed analysis
          </h3>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={(e) => fetchEventSales(Number(e.target.value))}
            defaultValue={events[0]?.eventId}
          >
            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.name} - {event.date ? formatDate(event.date) : "N/A"} -{" "}
                {event.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ticket Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ticket Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event-specific Charts */}
      {selectedEventSales && (
        <>
          {/* Area Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Area Sales - {selectedEventSales.eventName}
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    formatNumber(Number(value)),
                    name === "sold"
                      ? "Sold"
                      : name === "available"
                      ? "Remaining"
                      : "Total Tickets",
                  ]}
                />
                <Legend />
                <Bar dataKey="sold" fill="#10B981" name="Sold" />
                <Bar dataKey="available" fill="#F59E0B" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Basic Phase Sales Chart - detailed analysis below */}
          {phaseChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Phase Sales Analysis - {selectedEventSales.eventName}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={phaseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="sold" orientation="left" />
                  <YAxis
                    yAxisId="revenue"
                    orientation="right"
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue"
                        ? formatCurrency(Number(value))
                        : formatNumber(Number(value)),
                      name === "revenue" ? "Revenue" : "Sold Tickets",
                    ]}
                  />
                  <Legend />
                  <Area
                    yAxisId="sold"
                    type="monotone"
                    dataKey="sold"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Sold Tickets"
                  />
                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stackId="2"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Event Analysis Statistics */}
      {selectedEventSales && (
        <EventAnalysisStats
          userRole="organizer"
          eventId={selectedEventSales.eventId}
          eventName={selectedEventSales.eventName}
        />
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Events
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingEvents.map((event) => (
                  <tr key={event.eventId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.date ? formatDate(event.date) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : event.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.status === "approved"
                          ? "Approved"
                          : event.status === "pending"
                          ? "Pending"
                          : "Rejected"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
