import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaInfoCircle,
  FaSearch,
  FaSync,
  FaEye,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaQrcode,
  FaUser,
  FaTicketAlt,
  FaExchangeAlt,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import _ from "lodash";
import { BASE_URL } from "../../utils/const";
import React from "react";

interface TransactionSummary {
  transactionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  eventId: number;
  eventName: string;
  organizerName: string;
  organizerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  transactionDate: string;
}

interface TransactionDetail {
  transactionId: string;
  userId: number;
  userName: string;
  userEmail: string;
  eventId: number;
  eventName: string;
  organizerName: string;
  organizerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  transactionDate: string;
  customerInfo: {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
  };
  eventInfo: {
    eventId: number;
    eventName: string;
    eventDate: string;
    eventTime: string;
    location: string;
    status: string | null;
    organizerName: string;
    organizerEmail: string;
  };
  tickets: Array<{
    ticketId: number;
    ticketCode: string;
    status: string;
    price: number;
    purchaseDate: string;
    areaName: string;
    eventName: string;
    phaseStartTime: string;
    phaseEndTime: string;
  }>;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface TransactionStatsDto {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
  pendingRevenue: number;
}

const TRANSACTIONS_ENDPOINT = `${BASE_URL}/api/organizer/transactions`;
const STATS_ENDPOINT = `${BASE_URL}/api/organizer/transactions/stats`;

const OrganizerTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pageInput, setPageInput] = useState<string>("1");
  const [overallStats, setOverallStats] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  });

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [eventDateFilter, setEventDateFilter] = useState("");

  // Get unique events for filter dropdown
  const uniqueEvents = React.useMemo(() => {
    const events = transactions.reduce((acc, transaction) => {
      if (!acc.find((e) => e.eventId === transaction.eventId)) {
        acc.push({
          eventId: transaction.eventId,
          eventName: transaction.eventName,
        });
      }
      return acc;
    }, [] as { eventId: number; eventName: string }[]);
    return events.sort((a, b) => a.eventName.localeCompare(b.eventName));
  }, [transactions]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    _.debounce((term: string) => {
      setSearchTerm(term);
      // Do not reset pageInput or currentPage here to avoid input losing focus
    }, 700),
    []
  );

  const fetchTransactions = async (page: number = 0) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found.");
        return;
      }

      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get<
        ApiResponse<PaginatedResponse<TransactionSummary>>
      >(`${TRANSACTIONS_ENDPOINT}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        const paginatedData = response.data.data;
        setTransactions(paginatedData.content);
        setTotalPages(paginatedData.totalPages);
        setTotalElements(paginatedData.totalElements);
      } else {
        toast.error(response.data.message || "Failed to fetch transactions");
      }
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      setError("An error occurred while fetching transactions.");
      toast.error("An error occurred while fetching transactions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get<ApiResponse<TransactionStatsDto>>(
        STATS_ENDPOINT,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        const statsData = response.data.data;
        setOverallStats({
          totalRevenue: statsData.totalRevenue,
          pendingRevenue: statsData.pendingRevenue,
          completedTransactions: statsData.completedTransactions,
          pendingTransactions: statsData.pendingTransactions,
          failedTransactions: statsData.failedTransactions,
        });
      }
    } catch (error: any) {
      console.error("Error fetching overall stats:", error);
    }
  };

  const fetchTransactionDetail = async (transactionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found.");
        return;
      }

      setDetailLoading(true);
      const response = await axios.get<ApiResponse<TransactionDetail>>(
        `${TRANSACTIONS_ENDPOINT}/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setSelectedTransaction(response.data.data);
        setShowDetailModal(true);
      } else {
        toast.error(
          response.data.message || "Failed to fetch transaction details"
        );
      }
    } catch (error: any) {
      console.error("Error fetching transaction details:", error);
      toast.error("An error occurred while fetching transaction details.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
    fetchOverallStats();
  }, [currentPage, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchInput(term);
  };

  // Khi nhấn Enter hoặc blur input, mới thực sự tìm kiếm và reset trang
  const handleSearchInputConfirm = () => {
    if (searchInput !== searchTerm) {
      setSearchTerm(searchInput);
      if (currentPage !== 0) {
        setCurrentPage(0);
        setPageInput("1");
      }
    }
  };

  const handleRefresh = () => {
    fetchTransactions(currentPage);
  };

  const handleViewDetail = (transactionId: string) => {
    fetchTransactionDetail(transactionId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPageInput((page + 1).toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput) - 1;
    if (!isNaN(page) && page >= 0 && page < totalPages) {
      handlePageChange(page);
    } else {
      setPageInput((currentPage + 1).toString());
    }
  };

  const handlePageInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput) - 1;
      if (!isNaN(page) && page >= 0 && page < totalPages) {
        handlePageChange(page);
      } else {
        setPageInput((currentPage + 1).toString());
      }
    }
  };

  // Local filtering & searching
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      // Status filter
      if (statusFilter !== "all" && t.status?.toLowerCase() !== statusFilter) {
        return false;
      }

      // Event filter
      if (eventFilter !== "all" && t.eventId.toString() !== eventFilter) {
        return false;
      }

      // Date filter (expecting YYYY-MM-DD)
      if (eventDateFilter) {
        const txnDate = new Date(t.transactionDate);
        const filterDate = new Date(eventDateFilter);
        // compare only the date part
        if (
          txnDate.getFullYear() !== filterDate.getFullYear() ||
          txnDate.getMonth() !== filterDate.getMonth() ||
          txnDate.getDate() !== filterDate.getDate()
        ) {
          return false;
        }
      }

      // Search term (user, email, event, transaction id)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          (t.userName && t.userName.toLowerCase().includes(term)) ||
          (t.userEmail && t.userEmail.toLowerCase().includes(term)) ||
          (t.eventName && t.eventName.toLowerCase().includes(term)) ||
          t.transactionId.toLowerCase().includes(term);
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, statusFilter, eventFilter, eventDateFilter, searchTerm]);

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setEventFilter("all");
    setEventDateFilter("");
    setCurrentPage(0);
  };

  const renderStatusBadge = (status: string) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    let displayStatus = status;

    switch (status?.toLowerCase()) {
      case "completed":
        classes += " text-green-700 bg-green-100 border border-green-300";
        displayStatus = "Completed";
        break;
      case "pending":
        classes += " text-yellow-700 bg-yellow-100 border border-yellow-300";
        displayStatus = "Pending";
        break;
      case "failed":
        classes += " text-red-700 bg-red-100 border border-red-300";
        displayStatus = "Failed";
        break;
      default:
        classes += " text-gray-700 bg-gray-100 border border-gray-300";
        displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1);
    }
    return <span className={classes}>{displayStatus}</span>;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const DetailModal = () => {
    if (!selectedTransaction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FaMoneyBillWave className="text-green-600" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Transaction Details
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Transaction ID: {selectedTransaction.transactionId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Status and Amount Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaMoneyBillWave className="text-green-600" size={24} />
                    <span className="text-3xl font-bold text-gray-900">
                      {formatAmount(selectedTransaction.totalAmount)}
                    </span>
                  </div>
                  <p className="text-gray-600">Total Transaction Amount</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    {renderStatusBadge(selectedTransaction.status)}
                  </div>
                  <p className="text-gray-600 text-sm">Status</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Transaction Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaCreditCard className="text-green-600" size={16} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Transaction Info
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize flex items-center gap-1">
                      <FaCreditCard size={12} />
                      {selectedTransaction.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium flex items-center gap-1">
                      <FaCalendarAlt size={12} />
                      {formatDate(selectedTransaction.transactionDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer ID:</span>
                    <span className="font-medium">
                      #{selectedTransaction.userId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event ID:</span>
                    <span className="font-medium">
                      #{selectedTransaction.eventId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaUser className="text-blue-600" size={16} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Customer Info
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Full Name</p>
                    <p className="font-medium">
                      {selectedTransaction.customerInfo.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="font-medium text-blue-600">
                      {selectedTransaction.customerInfo.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="font-medium">
                      {selectedTransaction.customerInfo.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FaCalendarAlt className="text-purple-600" size={16} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Event Info
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Event Name</p>
                    <p className="font-medium">
                      {selectedTransaction.eventInfo.eventName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Date & Time</p>
                    <p className="font-medium">
                      {selectedTransaction.eventInfo.eventDate} at{" "}
                      {selectedTransaction.eventInfo.eventTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Location</p>
                    <p className="font-medium">
                      {selectedTransaction.eventInfo.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <FaTicketAlt className="text-orange-600" size={16} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Tickets ({selectedTransaction.tickets.length})
                </h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedTransaction.tickets.map((ticket, index) => (
                  <div
                    key={ticket.ticketId}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Ticket #{ticket.ticketId}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {ticket.areaName}
                        </p>
                      </div>
                      {renderStatusBadge(ticket.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-green-600">
                          {formatAmount(ticket.price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Purchase Date:</span>
                        <span className="font-medium">
                          {formatDate(ticket.purchaseDate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Selling Phase:</span>
                        <span className="font-medium text-purple-600">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phase Start:</span>
                        <span className="font-medium">
                          {formatDate(ticket.phaseStartTime)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phase End:</span>
                        <span className="font-medium">
                          {formatDate(ticket.phaseEndTime)}
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    {ticket.ticketCode && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaQrcode className="text-gray-600" size={14} />
                          <span className="text-sm font-medium text-gray-700">
                            QR Code
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <img
                            src={ticket.ticketCode}
                            alt={`QR Code for Ticket ${ticket.ticketId}`}
                            className="w-24 h-24 mx-auto mb-2 rounded border"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA3MkM2MC0wIDcyIDYwIDcyIDQ4QzcyIDM2IDYwIDI0IDQ4IDI0QzM2IDI0IDI0IDM2IDI0IDQ4QzI0IDYwIDM2IDcyIDQ4IDcyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                            }}
                          />
                          <button
                            onClick={() =>
                              window.open(ticket.ticketCode, "_blank")
                            }
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
                          >
                            <FaEye size={10} />
                            View Full Size
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate revenue statistics
  const revenueStats = {
    total: transactions.reduce(
      (sum, t) => sum + (t.status === "completed" ? t.totalAmount : 0),
      0
    ),
    pending: transactions.reduce(
      (sum, t) => sum + (t.status === "pending" ? t.totalAmount : 0),
      0
    ),
    completed: transactions.filter((t) => t.status === "completed").length,
    totalTransactions: transactions.length,
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <FaExchangeAlt className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Transactions
            </h1>
            <p className="text-gray-600">
              Monitor transactions for your events
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-2xl font-bold">
                {formatAmount(revenueStats.total)}
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
              <FaMoneyBillWave size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Pending Revenue
              </p>
              <p className="text-2xl font-bold">
                {formatAmount(revenueStats.pending)}
              </p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 p-3 rounded-lg">
              <FaSync size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Completed Orders
              </p>
              <p className="text-2xl font-bold">{revenueStats.completed}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
              <FaTicketAlt size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Total Transactions
              </p>
              <p className="text-2xl font-bold">
                {revenueStats.totalTransactions}
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
              <FaExchangeAlt size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, event, or transaction ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={handleSearchInputConfirm}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchInputConfirm();
                }}
              />
            </div>
          </div>

          {/* Status Filter and Actions */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {["all", "completed", "pending", "failed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="border-l border-gray-300 pl-3 flex gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
                  showAdvancedFilters
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="Advanced Filters"
              >
                <FaFilter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
              <button
                onClick={handleRefresh}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh"
              >
                <FaSync className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaFilter className="text-green-500" />
                Advanced Filters
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
              >
                <FaTimes size={12} />
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event
                </label>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  {uniqueEvents.map((event) => (
                    <option
                      key={event.eventId}
                      value={event.eventId.toString()}
                    >
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={eventDateFilter}
                  onChange={(e) => setEventDateFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(eventFilter !== "all" || eventDateFilter) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Active filters:</span>
                  {eventFilter !== "all" && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Event:{" "}
                      {uniqueEvents.find(
                        (e) => e.eventId.toString() === eventFilter
                      )?.eventName || eventFilter}
                    </span>
                  )}
                  {eventDateFilter && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Date: {eventDateFilter}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-3 border-b">Transaction ID</th>
              <th className="px-6 py-3 border-b">Customer</th>
              <th className="px-6 py-3 border-b">Event</th>
              <th className="px-6 py-3 border-b">Amount</th>
              <th className="px-6 py-3 border-b">Payment</th>
              <th className="px-6 py-3 border-b">Status</th>
              <th className="px-6 py-3 border-b">Date</th>
              <th className="px-6 py-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.transactionId}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 border-b">
                    <div className="font-mono text-xs">
                      {transaction.transactionId.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <div>
                      <div className="font-medium">{transaction.userName}</div>
                      <div className="text-gray-500 text-xs">
                        {transaction.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <div className="font-medium">{transaction.eventName}</div>
                  </td>
                  <td className="px-6 py-4 border-b font-medium">
                    {formatAmount(transaction.totalAmount)}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">
                      {transaction.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    {renderStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 border-b text-sm">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-6 py-4 border-b text-center">
                    <button
                      onClick={() =>
                        handleViewDetail(transaction.transactionId)
                      }
                      disabled={detailLoading}
                      className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                      title="View Details"
                    >
                      <FaInfoCircle />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "No transactions found matching your criteria"
                    : "No transactions found for your events"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition-colors"
          >
            Previous
          </button>

          {/* Calculate which pages to show */}
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            let startPage = Math.max(
              0,
              currentPage - Math.floor(maxVisiblePages / 2)
            );
            let endPage = Math.min(
              totalPages - 1,
              startPage + maxVisiblePages - 1
            );

            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(0, endPage - maxVisiblePages + 1);
            }

            if (startPage > 0) {
              pages.push(
                <button
                  key={0}
                  onClick={() => handlePageChange(0)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
                >
                  1
                </button>
              );
              if (startPage > 1) {
                pages.push(
                  <span key="start-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-4 py-2 rounded transition-colors ${
                    currentPage === i
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  {i + 1}
                </button>
              );
            }

            if (endPage < totalPages - 1) {
              if (endPage < totalPages - 2) {
                pages.push(
                  <span key="end-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition-colors"
          >
            Next
          </button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-600 text-sm">Go to page:</span>
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyPress={handlePageInputKeyPress}
              className="w-16 px-2 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="text-gray-600 text-sm">of {totalPages}</span>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalElements}
            </div>
            <div className="text-gray-600">Total Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(overallStats.totalRevenue)}
            </div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {formatAmount(overallStats.pendingRevenue)}
            </div>
            <div className="text-gray-600">Pending Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {transactions.length}
            </div>
            <div className="text-gray-600">Current Page</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalPages}
            </div>
            <div className="text-gray-600">Total Pages</div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && <DetailModal />}
    </div>
  );
};

export default OrganizerTransactions;
