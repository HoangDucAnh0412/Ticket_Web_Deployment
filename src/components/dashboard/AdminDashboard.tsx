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
  ResponsiveContainer,
} from "recharts";
import {
  FaUsers,
  FaTicketAlt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaTags,
  FaClock,
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

interface FinancialReport {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
}

const AdminDashboard: React.FC = () => {
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [transactionStats, setTransactionStats] =
    useState<TransactionStats | null>(null);
  const [financialReport, setFinancialReport] =
    useState<FinancialReport | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalMapTemplates, setTotalMapTemplates] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
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
      const [
        ticketStatsRes,
        transactionStatsRes,
        allEventsRes,
        usersRes,
        categoriesRes,
        mapTemplatesRes,
      ] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/tickets/stats`, { headers }),
        fetch(`${BASE_URL}/api/admin/transactions/stats`, { headers }),
        fetch(`${BASE_URL}/api/admin/events`, { headers }),
        fetch(`${BASE_URL}/api/admin/users?page=0&size=1`, { headers }),
        fetch(`${BASE_URL}/api/admin/categories`, { headers }),
        fetch(`${BASE_URL}/api/admin/map-templates`, { headers }),
      ]);

      const [
        ticketData,
        transactionData,
        allEventsData,
        usersData,
        categoriesData,
        mapTemplatesData,
      ] = await Promise.all([
        ticketStatsRes.json(),
        transactionStatsRes.json(),
        allEventsRes.json(),
        usersRes.json(),
        categoriesRes.json(),
        mapTemplatesRes.json(),
      ]);

      setTicketStats(ticketData.data);
      setTransactionStats(transactionData.data);
      setTotalUsers(usersData.data?.totalElements || 0);
      setTotalCategories(categoriesData.length || 0);
      setTotalMapTemplates(mapTemplatesData.length || 0);

      // Set all events for phase analysis dropdown
      if (allEventsData && Array.isArray(allEventsData)) {
        setAllEvents(allEventsData);
        setTotalEvents(allEventsData.length);
        setSelectedEvent(allEventsData[0] || null);
      }

      // Fetch financial report for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const financialRes = await fetch(
        `${BASE_URL}/api/admin/reports/financial?startDate=${
          startDate.toISOString().split("T")[0]
        }&endDate=${endDate.toISOString().split("T")[0]}`,
        { headers }
      );
      const financialData = await financialRes.json();
      setFinancialReport(financialData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Event ticketing system overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(totalUsers)}
              </p>
            </div>
          </div>
        </div>

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
              <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
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
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <FaCalendarAlt size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Events</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {formatNumber(totalEvents)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
              <FaTags size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Categories
              </h3>
              <p className="text-2xl font-bold text-pink-600">
                {formatNumber(totalCategories)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FaMapMarkedAlt size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Map Templates
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {formatNumber(totalMapTemplates)}
              </p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Event Selection for Phase Analysis */}
      {allEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaClock className="text-blue-500 mr-2" />
            Event Analysis
          </h3>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={(e) => {
              const eventId = Number(e.target.value);
              const event = allEvents.find((e) => e.eventId === eventId);
              setSelectedEvent(event || null);
            }}
            value={selectedEvent?.eventId || ""}
          >
            <option value="">
              Select event for detailed analysis ({allEvents.length} events)
            </option>
            {allEvents.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.name} - {event.status} -{" "}
                {event.date ? formatDate(event.date) : "N/A"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Event Analysis Statistics */}
      {selectedEvent && (
        <EventAnalysisStats
          userRole="admin"
          eventId={selectedEvent.eventId}
          eventName={selectedEvent.name}
        />
      )}

      {/* Financial Summary */}
      {financialReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Report (Last 30 Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(financialReport.totalRevenue)}
              </div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(financialReport.totalTransactions)}
              </div>
              <div className="text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(financialReport.averageTransactionAmount)}
              </div>
              <div className="text-gray-600">Average/Transaction</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
