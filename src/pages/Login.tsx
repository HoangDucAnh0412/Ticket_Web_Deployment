import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8085/api/auth/login",
        { login, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { jwt, username } = response.data;

      localStorage.setItem("token", jwt);
      localStorage.setItem("username", username);

      
      navigate("/dashboard");
      toast.success(`${response.data.message} - Xin chào ${username}`);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`${error.response?.data?.message || "Đăng nhập thất bại"}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full flex items-center justify-center">
        <form
          className="bg-white p-10 md:p-12 rounded-lg w-full max-w-md shadow-lg"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="mb-6 text-gray-500">Welcome back! Please enter your details.</p>

          <div className="mb-4">
            <label htmlFor="login" className="block text-sm mb-1">
              Email or Username
            </label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Enter your email or username"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div className="flex justify-end mb-6">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign in
          </button>

          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
