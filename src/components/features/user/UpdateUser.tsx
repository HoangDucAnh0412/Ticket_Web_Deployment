import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
}

const EditUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const ADMIN_USER_DETAIL_ENDPOINT = (userId: string) =>
    `${BASE_URL}/api/admin/users/${userId}`;
  const ADMIN_USER_UPDATE_ENDPOINT = (userId: string) =>
    `${BASE_URL}/api/admin/users/${userId}`;
  const ADMIN_USER_ACTIVATE_ENDPOINT = (userId: string) =>
    `${BASE_URL}/api/admin/users/${userId}/activate`;
  const ADMIN_USER_DEACTIVATE_ENDPOINT = (userId: string) =>
    `${BASE_URL}/api/admin/users/${userId}/deactivate`;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to continue");
          navigate("/login");
          return;
        }

        const response = await axios.get(ADMIN_USER_DETAIL_ENDPOINT(userId!), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setUser(response.data.data);
          setFormData(response.data.data);
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Unable to load user information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      await axios.put(ADMIN_USER_UPDATE_ENDPOINT(userId!), formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User information updated successfully!");
      navigate("/dashboard/user");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to update user information"
      );
    }
  };

  const handleToggleActive = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const endpoint = formData.active
        ? ADMIN_USER_DEACTIVATE_ENDPOINT(userId!)
        : ADMIN_USER_ACTIVATE_ENDPOINT(userId!);

      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        active: !prev.active,
      }));

      toast.success(
        formData.active
          ? "Account deactivated successfully!"
          : "Account activated successfully!"
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to change account status"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>User information not found</p>
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
        <span className="text-gray-700 font-semibold">Edit User</span>
      </nav>

      {/* Main content */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Edit User Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="ORGANIZER">Organizer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleToggleActive}
              className={`px-4 py-2 rounded-md ${
                formData.active
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {formData.active ? "Deactivate Account" : "Activate Account"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/user")}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
