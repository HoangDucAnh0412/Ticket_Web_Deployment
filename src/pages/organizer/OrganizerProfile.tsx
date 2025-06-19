import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaSignOutAlt,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";
import { BASE_URL } from "../../utils/const";

interface OrganizerProfile {
  userId: number;
  username: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  organizationName: string | null;
  contactEmail: string | null;
  description: string | null;
}

interface ProfileUpdateRequest {
  fullName: string;
  phone: string;
  address: string;
  organizationName: string;
  contactEmail: string;
  description: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: OrganizerProfile;
}

const OrganizerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    fullName: "",
    phone: "",
    address: "",
    organizationName: "",
    contactEmail: "",
    description: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to continue");
        navigate("/login");
        return;
      }

      const response = await axios.get<ApiResponse>(
        `${BASE_URL}/api/organizer/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setProfile(response.data.data);
        // Initialize form data with current profile data
        setFormData({
          fullName: response.data.data.fullName || "",
          phone: response.data.data.phone || "",
          address: response.data.data.address || "",
          organizationName: response.data.data.organizationName || "",
          contactEmail: response.data.data.contactEmail || "",
          description: response.data.data.description || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Unable to load profile information");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to continue");
        navigate("/login");
        return;
      }

      // Basic validation
      if (!formData.fullName.trim()) {
        toast.error("Please enter your full name");
        setSaving(false);
        return;
      }

      console.log("Sending update request with data:", formData);

      const response = await axios.put<ApiResponse>(
        `${BASE_URL}/api/organizer/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update response:", response.data);

      // Check for successful response
      if (response.data && response.data.status === "success") {
        if (response.data.data) {
          setProfile(response.data.data);
        }
        setIsEditing(false);
        toast.success(response.data.message || "Profile updated successfully!");
      } else {
        toast.error("Invalid server response");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Unable to update profile information";
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        address: profile.address || "",
        organizationName: profile.organizationName || "",
        contactEmail: profile.contactEmail || "",
        description: profile.description || "",
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Account Information
          </h1>
          <p className="text-gray-600">
            Manage your personal and organization information
          </p>
        </div>
        <div className="flex space-x-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Log out
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaUser className="text-3xl text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {profile?.fullName || profile?.username || "Not updated yet"}
              </h3>
              <p className="text-gray-600">
                {profile?.organizationName || "No organization"}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <FaIdCard className="mr-2" />
                  ID: {profile?.userId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Details</h2>
            </div>
            <div className="p-6">
              {isEditing ? (
                /* Edit Form */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter contact email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter a description about your organization, event experience..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <FaSave className="mr-2" />
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-6">
                  {/* Account Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="font-medium text-gray-900">
                            {profile?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            {profile?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {profile?.fullName || "Not updated yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium text-gray-900">
                            {profile?.phone || "Not updated yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start md:col-span-2">
                        <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-900">
                            {profile?.address || "Not updated yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organization Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Organization Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <FaBuilding className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Organization Name
                          </p>
                          <p className="font-medium text-gray-900">
                            {profile?.organizationName || "Not updated yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Contact Email</p>
                          <p className="font-medium text-gray-900">
                            {profile?.contactEmail || "Not updated yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start md:col-span-2">
                        <FaFileAlt className="text-gray-400 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="font-medium text-gray-900">
                            {profile?.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(!profile?.fullName ||
                    !profile?.phone ||
                    !profile?.organizationName) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-yellow-400 mr-3">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">
                            Incomplete information
                          </h4>
                          <p className="text-sm text-yellow-700">
                            Please update all information for the best
                            experience
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
