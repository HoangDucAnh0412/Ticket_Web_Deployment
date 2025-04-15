import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8085/api/auth/logout",
        {}, // body rỗng
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Xoá token và username khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      // Chuyển hướng về trang login
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      alert("Đăng xuất thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🎉 Dashboard</h1>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <p>
          <strong>👤 Tên đăng nhập:</strong> {username}
        </p>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Profile;
