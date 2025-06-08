import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface PrivateRouteProps {
  children: React.ReactNode;
}

interface DecodedToken {
  role: string;
  exp: number;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    // Decode and verify token
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Get current path
    const currentPath = location.pathname;

    // If user is admin and trying to access organizer routes
    if (decodedToken.role === "admin" && currentPath.startsWith("/organizer")) {
      return <Navigate to="/dashboard" replace />;
    }

    // If user is organizer and trying to access admin routes
    if (
      decodedToken.role === "organizer" &&
      currentPath.startsWith("/dashboard")
    ) {
      return <Navigate to="/organizer/events" replace />;
    }

    // If all checks pass, render the protected component
    return <>{children}</>;
  } catch (error) {
    // If token is invalid, remove it and redirect to login
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default PrivateRoute;
