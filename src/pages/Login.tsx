import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils/const";

function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/login`;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_ENDPOINT,
        { login, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { jwt, username } = response.data;

      const decoded: any = jwtDecode(jwt);
      let role = decoded.role;
      if (!role && Array.isArray(decoded.roles)) role = decoded.roles[0];
      if (!role && Array.isArray(decoded.authorities))
        role = decoded.authorities[0];

      localStorage.setItem("token", jwt);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      if (role === "ADMIN") {
        navigate("/dashboard");
      } else if (role === "ORGANIZER") {
        navigate("/organizer/events");
      } else {
        toast.error("Account has no access rights!");
        return;
      }

      toast.success(`${response.data.message} - Welcome ${username}`);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`${error.response?.data?.message || "Login failed"}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md px-8 py-6 border border-gray-500 rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title with Tickvivo */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-5">
              Sign in account
            </h2>
            <div className="inline-flex items-center mb-5">
              <span className="text-2xl font-bold text-black">Tick</span>
              <span className="text-2xl font-bold text-green-500">vi</span>
              <span className="text-2xl font-bold text-black">vo</span>
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            {login && (
              <label
                htmlFor="login"
                className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Email
              </label>
            )}
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            {password && (
              <label
                htmlFor="password"
                className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Password
              </label>
            )}
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-6">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-3xl text-base font-bold"
          >
            Sign In
          </button>

          {/* Create an Account Link */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Create organizer account
            </Link>
          </p>

          {/* Terms and Privacy Notice */}
          <p className="text-center text-gray-600 text-sm mt-2 px-4">
            By purchasing or signing in, you agree to our{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              user agreement
            </span>{" "}
            and acknowledge our{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              privacy notice
            </span>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
