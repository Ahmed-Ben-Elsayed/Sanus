import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; 

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
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const navigate = useNavigate();

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
        navigate("/", { replace: true }); 
      } else {
        setIsAuthenticated(true);
      }
      setChecked(true);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!checked) return null;

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
