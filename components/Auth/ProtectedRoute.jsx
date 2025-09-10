import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

// Function to check token validity
const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) throw new Error("Token has no expiration date");

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp <= currentTime) {
      localStorage.removeItem("token");
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Invalid token:", err.message);
    localStorage.removeItem("token");
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const [checked, setChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const valid = token && isTokenValid(token);

      if (!valid) {
        setIsAuthenticated(false);
        toast.error("Please login again.", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        setIsAuthenticated(true);
      }
      setChecked(true);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!checked) return null; 

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
