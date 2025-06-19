import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../../../utils/const";

interface UserData {
  username: string;
  password: string;
  email: string;
  role: string;
  fullName: string;
  phone: string;
  address: string;
}

const ADMIN_CREATE_USERS_ENDPOINT = `${BASE_URL}/api/admin/users`;

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

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Phone validation function (Vietnam format)
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

    // Remove error when user starts typing again
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Realtime validation
    if (name === "email" && value) {
      if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Invalid email format",
        }));
      }
    }

    if (name === "phone" && value) {
      if (!validatePhone(value)) {
        setErrors((prev) => ({
          ...prev,
          phone: "Invalid phone number format",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to create a user.");
      return;
    }

    // Validate all fields
    const newErrors: Partial<UserData> = {};
    if (!userData.username) {
      newErrors.username = "Please enter a username";
    }
    if (!userData.password) {
      newErrors.password = "Please enter a password";
    }
    if (!userData.email) {
      newErrors.email = "Please enter an email";
    } else if (!validateEmail(userData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!userData.fullName) {
      newErrors.fullName = "Please enter full name";
    }
    if (!userData.phone) {
      newErrors.phone = "Please enter a phone number";
    } else if (!validatePhone(userData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    // If there are errors, show and stop submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please check your information");
      return;
    }

    try {
      // Gọi API tạo user mới
      const response = await axios.post(ADMIN_CREATE_USERS_ENDPOINT, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("User created successfully!");
        setUserData(initialUserData);
        setTimeout(() => {
          navigate("/dashboard/user");
        }, 2000);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      if (error.response?.status === 403) {
        toast.error("Please check your information, there may be duplicates!");
      } else if (msg.includes("username")) {
        toast.error("Username already exists!");
      } else if (msg.includes("email")) {
        toast.error("Email already exists!");
      } else if (msg.includes("phone")) {
        toast.error("Phone number already exists!");
      } else {
        toast.error(`An error occurred: ${msg}`);
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
          Create New User
        </h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
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
                Password
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
                Role
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
                Full Name
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
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                required
                placeholder="e.g. 0987654321"
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
              Address
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
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
