import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { BASE_URL } from "../utils/const";

function Profile() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout`;

  const handleLogout = async () => {
    try {
      await axios.post(
        LOGOUT_ENDPOINT,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("username");

      navigate("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
      alert("Sign out failed. Please try again!");
    }
  };

  return (
    <div>
      {/* Header with Tickvivo Logo */}
      {/* Profile Card */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-3xl shadow-lg border border-gray-200 space-y-6">
        {/* Welcome Message */}
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-green-500 text-4xl" />
          <div>
            <p className="text-lg font-semibold text-gray-700">
              Welcome, {username}!
            </p>
            <p className="text-sm text-gray-500">
              Manage your account details below.
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-3xl hover:bg-green-600 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Profile;
