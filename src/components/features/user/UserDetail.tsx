import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaLock } from "react-icons/fa";
import { BASE_URL } from "../../../utils/const";

interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ADMIN_USER_DETAIL_ENDPOINT = (userId: string) =>
  `${BASE_URL}/api/admin/users/${userId}`;

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để xem chi tiết");
          return;
        }

        const response = await axios.get(ADMIN_USER_DETAIL_ENDPOINT(userId!), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const getStatusColor = (active: boolean) => {
    return active
      ? "bg-green-50 border-green-400 text-green-700"
      : "bg-red-50 border-red-400 text-red-700";
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border border-red-300";
      case "organizer":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      case "user":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Không tìm thấy thông tin người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer />
      {/* Breadcrumb */}
      <nav className="p-6 flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/dashboard" className="hover:underline text-blue-600">
          Home
        </Link>
        <span>&gt;</span>
        <Link to="/dashboard/user" className="hover:underline text-blue-600">
          User
        </Link>
        <span>&gt;</span>
        <span className="text-gray-700 font-semibold">User Details</span>
      </nav>

      {/* Main content */}
      <div className="p-0 md:p-0 flex flex-col md:flex-row gap-8 items-start md:items-stretch pl-6">
        {/* Avatar + Name + Role */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/3 border-r md:pr-8 mb-6 md:mb-0">
          <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-indigo-200 mb-4">
            {user.fullName.trim().split(" ").slice(-1)[0][0].toUpperCase()}
          </div>
          <div className="text-lg font-semibold text-gray-800 text-center">
            {user.fullName}
          </div>
          <div
            className={`mt-2 px-3 py-1 text-sm rounded-full font-medium ${getRoleColor(
              user.role
            )}`}
          >
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>

        {/* Info box */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="font-bold text-xl text-gray-900 mb-2">
            Thông tin người dùng
          </div>
          {/* Top info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-900">{user.email}</span>
              {user.active ? (
                <FaCheckCircle className="text-green-500 ml-1" title="Active" />
              ) : (
                <FaLock className="text-red-400 ml-1" title="Inactive" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Tên đăng nhập:</span>
              <span className="text-gray-900">{user.username || "–"}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <span className="font-medium text-gray-700">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  user.active
                )}`}
              >
                {user.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Bottom info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-sm font-bold text-gray-700 mb-1">
                Số điện thoại
              </div>
              <div className="text-gray-800">{user.phone || "–"}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700 mb-1">
                Địa chỉ
              </div>
              <div className="text-gray-800">{user.address || "–"}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700 mb-1">
                Ngày tạo
              </div>
              <div className="text-gray-800">
                {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-700 mb-1">
                Cập nhật lần cuối
              </div>
              <div className="text-gray-800">
                {new Date(user.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
