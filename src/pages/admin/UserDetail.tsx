import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft,
  FaTicketAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaQrcode,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaHistory,
} from "react-icons/fa";
import { BASE_URL } from "../../utils/const";

interface Ticket {
  ticketCode: string;
  status: string;
  purchaseDate: string;
  price: number;
  eventName: string;
  areaName: string;
}

interface Transaction {
  transactionId: string;
  eventId: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  transactionDate: string;
  tickets: Ticket[];
}

interface UserHistoryData {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  transactions: Transaction[];
}

interface UserHistoryResponse {
  status: string;
  message: string;
  data: UserHistoryData;
}

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userHistory, setUserHistory] = useState<UserHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem thông tin người dùng");
          return;
        }

        const response = await axios.get<UserHistoryResponse>(
          `${BASE_URL}/api/admin/users/${userId}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          setUserHistory(response.data.data);
        } else {
          setError("Không có dữ liệu lịch sử giao dịch");
        }
      } catch (error: any) {
        console.error("Error fetching user history:", error);
        if (error.response) {
          setError(
            `Lỗi: ${error.response.status} - ${
              error.response.data?.message || "Không thể tải lịch sử giao dịch"
            }`
          );
        } else {
          setError("Không thể kết nối đến server");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserHistory();
    }
  }, [userId]);

  const toggleTransactionExpansion = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderStatusBadge = (status: string) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    let displayStatus = status;

    switch (status.toLowerCase()) {
      case "completed":
        classes += " text-green-700 bg-green-100 border border-green-300";
        displayStatus = "Hoàn thành";
        break;
      case "pending":
        classes += " text-yellow-700 bg-yellow-100 border border-yellow-300";
        displayStatus = "Đang xử lý";
        break;
      case "failed":
        classes += " text-red-700 bg-red-100 border border-red-300";
        displayStatus = "Thất bại";
        break;
      case "sold":
        classes += " text-blue-700 bg-blue-100 border border-blue-300";
        displayStatus = "Đã bán";
        break;
      default:
        classes += " text-gray-700 bg-gray-100 border border-gray-300";
        displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    }

    return <span className={classes}>{displayStatus}</span>;
  };

  const handleViewQRCode = (qrUrl: string) => {
    window.open(qrUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
        </div>
        <Link
          to="/dashboard/user"
          className="mt-4 inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!userHistory) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Không tìm thấy thông tin người dùng
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            to="/dashboard/user"
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <FaArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Chi tiết người dùng
            </h1>
            <p className="text-gray-600">Lịch sử giao dịch và vé</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white shadow rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaUser className="mr-2 text-blue-500" />
            Thông tin người dùng
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <FaIdCard className="mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{userHistory.userId}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaUser className="mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Tên đăng nhập</p>
                <p className="font-medium">{userHistory.username}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userHistory.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaUser className="mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>
                <p className="font-medium">{userHistory.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaHistory className="mr-2 text-green-500" />
            Lịch sử giao dịch ({userHistory.transactions.length})
          </h2>
        </div>

        {userHistory.transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <FaHistory className="mx-auto mb-4 text-4xl text-gray-300" />
            <p>Người dùng chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userHistory.transactions.map((transaction) => (
              <div key={transaction.transactionId} className="px-6 py-4">
                {/* Transaction Header */}
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded"
                  onClick={() =>
                    toggleTransactionExpansion(transaction.transactionId)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FaCreditCard className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Giao dịch #{transaction.transactionId.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {formatDateTime(transaction.transactionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg text-green-600">
                        {formatCurrency(transaction.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                    <div>{renderStatusBadge(transaction.status)}</div>
                    <div className="text-gray-400">
                      {expandedTransactions.has(transaction.transactionId)
                        ? "▼"
                        : "▶"}
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                {expandedTransactions.has(transaction.transactionId) && (
                  <div className="mt-4 pl-12">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <FaTicketAlt className="mr-2 text-purple-500" />
                      Vé đã mua ({transaction.tickets.length})
                    </h4>

                    {transaction.tickets.length === 0 ? (
                      <p className="text-gray-500 italic">
                        Không có vé nào trong giao dịch này
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transaction.tickets.map((ticket, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 text-sm mb-1">
                                  {ticket.eventName}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  Khu vực:{" "}
                                  <span className="font-medium">
                                    {ticket.areaName}
                                  </span>
                                </p>
                                <p className="text-lg font-semibold text-green-600">
                                  {formatCurrency(ticket.price)}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {renderStatusBadge(ticket.status)}
                              </div>
                            </div>

                            <div className="text-sm text-gray-500 mb-3">
                              <p className="flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                Mua: {formatDateTime(ticket.purchaseDate)}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                handleViewQRCode(ticket.ticketCode)
                              }
                              className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                            >
                              <FaQrcode className="mr-2" />
                              Xem mã QR
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
