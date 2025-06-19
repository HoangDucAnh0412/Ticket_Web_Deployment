import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  FaClock,
  FaTicketAlt,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaChartLine,
  FaPlayCircle,
  FaPauseCircle,
  FaStopCircle,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import { BASE_URL } from "../../utils/const";

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
  areaId?: number;
  areaName?: string;
  startTime: string;
  endTime: string;
  soldTickets: number;
  availableTickets?: number;
  revenue: number;
  status?: string;
}

interface EventSalesResponse {
  eventId: number;
  eventName: string;
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  totalRevenue: number;
  areas: AreaSales[];
  phases: PhaseSales[];
}

interface Props {
  userRole: "admin" | "organizer";
  eventId: number;
  eventName: string;
}

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const EventAnalysisStats: React.FC<Props> = ({
  userRole,
  eventId,
  eventName,
}) => {
  const [eventSales, setEventSales] = useState<EventSalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId, userRole]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError("");
      const headers = getAuthHeaders();

      // Determine API endpoint based on user role
      const salesEndpoint =
        userRole === "admin"
          ? `${BASE_URL}/api/admin/tickets/events/${eventId}/ticket-stats`
          : `${BASE_URL}/api/organizer/tickets/events/${eventId}/sales`;

      const phaseStatsEndpoint =
        userRole === "admin"
          ? `${BASE_URL}/api/admin/tickets/events/${eventId}/phase-stats`
          : `${BASE_URL}/api/organizer/tickets/events/${eventId}/phase-stats`;

      // Fetch both sales data and phase stats
      const [salesResponse, phaseResponse] = await Promise.all([
        fetch(salesEndpoint, { headers }),
        fetch(phaseStatsEndpoint, { headers }),
      ]);

      if (!salesResponse.ok) {
        throw new Error(`Failed to fetch sales data: ${salesResponse.status}`);
      }

      const salesData = await salesResponse.json();
      let eventData = salesData.data;

      // If phase stats endpoint is available, merge the data
      if (phaseResponse.ok) {
        const phaseData = await phaseResponse.json();
        if (phaseData.data && Array.isArray(phaseData.data)) {
          eventData = {
            ...eventData,
            phases: phaseData.data,
          };
        }
      }

      setEventSales(eventData);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Unable to load event analysis data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPhaseStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "active";
    return "ended";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <FaClock className="text-yellow-500" />;
      case "active":
        return <FaPlayCircle className="text-green-500" />;
      case "ended":
        return <FaStopCircle className="text-red-500" />;
      default:
        return <FaPauseCircle className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "Ongoing";
      case "ended":
        return "Ended";
      default:
        return "Unknown";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800 animate-pulse";
      case "ended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600">Loading analysis data...</span>
        </div>
      </div>
    );
  }

  if (error || !eventSales) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">⚠️ {error || "No data"}</p>
          <p className="text-sm mt-2">
            Please try again later or select another event
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const areasChartData =
    eventSales.areas?.map((area) => ({
      name: area.areaName,
      sold: area.soldTickets,
      available: area.availableTickets,
      total: area.totalTickets,
      price: area.price,
      revenue: area.soldTickets * area.price,
      sellRate: ((area.soldTickets / area.totalTickets) * 100).toFixed(1),
    })) || [];

  const phasesChartData =
    eventSales.phases?.map((phase, index) => ({
      name: phase.areaName || `Phiên ${phase.phaseId}`,
      fullName: phase.areaName || `Phiên ${phase.phaseId}`,
      sold: phase.soldTickets,
      revenue: phase.revenue,
      startTime: phase.startTime,
      endTime: phase.endTime,
      status: phase.status || getPhaseStatus(phase.startTime, phase.endTime),
      color: COLORS[index % COLORS.length],
    })) || [];

  const ticketStatusData = [
    { name: "Sold", value: eventSales.soldTickets, color: "#10B981" },
    { name: "Remaining", value: eventSales.availableTickets, color: "#F59E0B" },
  ];

  // Calculate totals for overview
  const totalPhases = eventSales.phases?.length || 0;
  const totalAreas = eventSales.areas?.length || 0;
  const totalPhaseTickets =
    eventSales.phases?.reduce((sum, phase) => sum + phase.soldTickets, 0) || 0;
  const totalPhaseRevenue =
    eventSales.phases?.reduce((sum, phase) => sum + phase.revenue, 0) || 0;
  const totalAvailablePhaseTickets =
    eventSales.phases?.reduce(
      (sum, phase) => sum + (phase.availableTickets || 0),
      0
    ) || 0;
  const activePhases = phasesChartData.filter(
    (phase) => phase.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      {/* Event Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FaChartLine className="text-blue-500 mr-3" />
          Event Analysis: {eventName}
        </h3>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaTicketAlt className="text-blue-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(eventSales.totalTickets)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-green-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(eventSales.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-purple-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Areas</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(totalAreas)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaClock className="text-orange-600 text-xl mr-3" />
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Sale Phases
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(totalPhases)}
                  {activePhases > 0 && (
                    <span className="text-sm text-green-600 ml-1">
                      ({activePhases} ongoing)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Status Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Ticket Status
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}\n${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Overview Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Ticket Sales Ratio</p>
                <p className="text-xl font-bold text-gray-900">
                  {(
                    (eventSales.soldTickets / eventSales.totalTickets) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Average Ticket Price</p>
                <p className="text-xl font-bold text-gray-900">
                  {eventSales.soldTickets > 0
                    ? formatCurrency(
                        eventSales.totalRevenue / eventSales.soldTickets
                      )
                    : "0 ₫"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Tickets Sold</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(eventSales.soldTickets)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Tickets Remaining</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(eventSales.availableTickets)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Areas Analysis */}
      {areasChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaMapMarkerAlt className="text-purple-500 mr-2" />
            Area Analysis
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Areas Bar Chart */}
            <div>
              <h5 className="text-md font-medium text-gray-700 mb-3">
                Tickets Sold by Area
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={areasChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name === "sold" ? "Sold" : "Remaining",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="sold" fill="#10B981" name="Sold" />
                  <Bar dataKey="available" fill="#F59E0B" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Areas Revenue Chart */}
            <div>
              <h5 className="text-md font-medium text-gray-700 mb-3">
                Revenue by Area
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areasChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Areas Detail Table */}
          <div className="mt-6">
            <h5 className="text-md font-medium text-gray-700 mb-3">
              Area Details
            </h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sell Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventSales.areas.map((area) => (
                    <tr key={area.areaId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {area.areaName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(area.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(area.soldTickets)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(area.availableTickets)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (area.soldTickets / area.totalTickets) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {(
                              (area.soldTickets / area.totalTickets) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(area.soldTickets * area.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Phases Analysis */}
      {phasesChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaClock className="text-blue-500 mr-2" />
            Phase Analysis
          </h4>

          {/* Phase Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(totalPhases)}
                </div>
                <div className="text-sm text-blue-600">Total Sale Phases</div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(totalPhaseTickets)}
                </div>
                <div className="text-sm text-green-600">
                  Tickets Sold by Phase
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPhaseRevenue)}
                </div>
                <div className="text-sm text-yellow-600">Revenue by Phase</div>
              </div>
            </div>
          </div>

          {/* Phases Performance Chart */}
          <div className="mb-6">
            <h5 className="text-md font-medium text-gray-700 mb-3">
              Phase Performance
            </h5>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={phasesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="tickets" orientation="left" />
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
                    name === "revenue" ? "Revenue" : "Tickets Sold",
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId="tickets"
                  dataKey="sold"
                  fill="#10B981"
                  name="Tickets Sold"
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Phases Detail Table */}
          <div>
            <h5 className="text-md font-medium text-gray-700 mb-3">
              Phase Details
            </h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventSales.phases.map((phase) => {
                    const status =
                      phase.status ||
                      getPhaseStatus(phase.startTime, phase.endTime);
                    return (
                      <tr key={phase.phaseId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {phase.areaName || `Phase ${phase.phaseId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span
                              className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                                status
                              )}`}
                            >
                              {getStatusText(status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(phase.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(phase.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(phase.soldTickets)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {phase.availableTickets !== undefined
                            ? formatNumber(phase.availableTickets)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(phase.revenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAnalysisStats;
