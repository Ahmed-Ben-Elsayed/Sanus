import { useEffect, useState } from "react";
import "./App.css";
import { useTranslation } from "react-i18next";
import Login from "../components/Auth/Login";
import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import CreatePage from "../components/onBoarding/CreatePage";
import DashBoard from "../components/layout/DashBoard";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/Admin"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
       

        <Route
          path="/Admin/:id"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
