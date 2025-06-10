import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BASE_URL } from "../utils/const";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    address: "",
    organizationName: "",
    contactEmail: "",
    description: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  const REGISTER_ENDPOINT = `${BASE_URL}/api/organizer/register`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required";
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "Contact email is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Invalid contact email format";
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please check your registration information");
      return;
    }

    try {
      const response = await axios.post(REGISTER_ENDPOINT, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      toast.success("Organizer account created successfully! Please sign in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to create account. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-2xl px-8 py-6 border border-gray-500 rounded-3xl mx-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title with Tickvivo */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-5">
              Create Organizer Account
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              Join us to organize your events
            </p>
            <div className="inline-flex items-center mb-5">
              <span className="text-2xl font-bold text-black">Tick</span>
              <span className="text-2xl font-bold text-green-500">vi</span>
              <span className="text-2xl font-bold text-black">vo</span>
            </div>
          </div>

          {/* Username and Password Row */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-1/2">
              {formData.username && (
                <label
                  htmlFor="username"
                  className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
                >
                  Username
                </label>
              )}
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            <div className="relative w-full md:w-1/2">
              {formData.password && (
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
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            {formData.email && (
              <label
                htmlFor="email"
                className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Email
              </label>
            )}
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Full Name and Phone Row */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-1/2">
              {formData.fullName && (
                <label
                  htmlFor="fullName"
                  className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
                >
                  Full Name
                </label>
              )}
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="relative w-full md:w-1/2">
              {formData.phone && (
                <label
                  htmlFor="phone"
                  className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
                >
                  Phone Number
                </label>
              )}
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="relative">
            {formData.address && (
              <label
                htmlFor="address"
                className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Address
              </label>
            )}
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Organization Name and Contact Email Row */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-1/2">
              {formData.organizationName && (
                <label
                  htmlFor="organizationName"
                  className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
                >
                  Organization Name
                </label>
              )}
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                placeholder="Organization Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {errors.organizationName && (
                <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>
              )}
            </div>

            <div className="relative w-full md:w-1/2">
              {formData.contactEmail && (
                <label
                  htmlFor="contactEmail"
                  className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
                >
                  Contact Email
                </label>
              )}
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Contact Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="relative">
            {formData.description && (
              <label
                htmlFor="description"
                className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Description
              </label>
            )}
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Organization Description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-3xl text-base font-bold hover:bg-green-800 transition-colors duration-200"
          >
            Create Organizer Account
          </button>

          {/* Links */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="text-center text-gray-600 text-sm mt-2 px-4">
            By creating an account, you agree to our{" "}
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

export default Register;
