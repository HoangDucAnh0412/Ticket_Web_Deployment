import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

interface UserData {
  username: string;
  password: string;
  email: string;
  role: string;
  fullName: string;
  phone: string;
  address: string;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const initialUserData: UserData = {
    username: "",
    password: "",
    email: "",
    role: "USER",
    fullName: "",
    phone: "",
    address: "",
  };

  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [errors, setErrors] = useState<Partial<UserData>>({});

  // Hàm validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Hàm validate số điện thoại (định dạng Việt Nam)
  const validatePhone = (phone: string) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Validate realtime
    if (name === "email" && value) {
      if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Email không đúng định dạng",
        }));
      }
    }

    if (name === "phone" && value) {
      if (!validatePhone(value)) {
        setErrors((prev) => ({
          ...prev,
          phone: "Số điện thoại không đúng định dạng",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để tạo người dùng.");
      return;
    }

    // Validate tất cả các trường
    const newErrors: Partial<UserData> = {};
    if (!userData.username) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    }
    if (!userData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }
    if (!userData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(userData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }
    if (!userData.fullName) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }
    if (!userData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(userData.phone)) {
      newErrors.phone = "Số điện thoại không đúng định dạng";
    }

    // Nếu có lỗi, hiển thị và dừng việc submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      // Kiểm tra trùng lặp trước khi tạo user
      const checkResponse = await axios.get(
        "http://localhost:8085/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        checkResponse.data &&
        checkResponse.data.data &&
        checkResponse.data.data.content
      ) {
        const existingUsers = checkResponse.data.data.content;

        // Kiểm tra trùng username
        const duplicateUsername = existingUsers.find(
          (user: any) =>
            user.username.toLowerCase() === userData.username.toLowerCase()
        );
        if (duplicateUsername) {
          toast.error("Tên đăng nhập đã tồn tại!");
          return;
        }

        // Kiểm tra trùng email
        const duplicateEmail = existingUsers.find(
          (user: any) =>
            user.email.toLowerCase() === userData.email.toLowerCase()
        );
        if (duplicateEmail) {
          toast.error("Email đã tồn tại!");
          return;
        }

        // Kiểm tra trùng số điện thoại
        const duplicatePhone = existingUsers.find(
          (user: any) => user.phone === userData.phone
        );
        if (duplicatePhone) {
          toast.error("Số điện thoại đã tồn tại!");
          return;
        }
      }
      toast.success("Tạo người dùng thành công!");
      setUserData(initialUserData);
      setTimeout(() => {
        navigate("/dashboard/user");
      }, 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      if (msg.includes("username")) {
        toast.error("Tên đăng nhập đã tồn tại!");
      } else if (msg.includes("email")) {
        toast.error("Email đã tồn tại!");
      } else if (msg.includes("phone")) {
        toast.error("Số điện thoại đã tồn tại!");
      } else {
        toast.error(`Có lỗi xảy ra: ${msg}`);
      }
    }
  };

  const handleCancel = () => {
    setUserData(initialUserData);
    setErrors({});
    navigate("/dashboard/user");
  };

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
        <span className="text-gray-700 font-semibold">Create User</span>
      </nav>

      {/* Main content */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Tạo Người Dùng Mới
        </h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={userData.username}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full p-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full p-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full p-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <select
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="USER">User</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={userData.fullName}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full p-2 border ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                required
                placeholder="VD: 0987654321"
                className={`mt-1 block w-full p-2 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Tạo người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
