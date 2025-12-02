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
    if (process.env.NODE_ENV === "production") {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
  const { i18n } = useTranslation();
  useEffect(() => {
    document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

const adminPaths = [
  "/",
  "/Admin",
  "/Admin/:id",
  "/Admin/On_Boarding",
  "/Admin/On_Boarding/:id",
  "/Admin/On_Boarding/CreatePage",
  "/Admin/Account_Customers",
  "/Admin/Account_Customers/moreInfo",
  "/Admin/Tracking_Subscription",
  "/Admin/Tracking_Subscription/Add",
  "/Admin/Tracking_Subscription/Change_Location",
  "/Admin/Tracking_Subscription/moreinfo",
  "/Admin/Tracking_Subscription/time_slot",
  "/Admin/Tracking_Subscription/Change_Box",
  "/Admin/Tracking_Subscription/scheduled_freeze",
  "/Admin/Restaurant_Orders",
  "/Admin/Restaurant_Orders/add_note",
  "/Admin/Restaurant_Orders/moreinfo",
  "/Admin/Timeslot",
  "/Admin/Timeslot/Add",
  "/Admin/Timeslot/Edit",
  "/Admin/Plans",
  "/Admin/Plans/Add",
  "/Admin/Plans/Edit",
  "/Admin/Packages",
  "/Admin/Packages/Add",
  "/Admin/Packages/Edit",
  "/Admin/Meals",
  "/Admin/Meals/Add",
  "/Admin/Meals/Edit",
  "/Admin/Templates",
  "/Admin/Templates/Add",
  "/Admin/Templates/Edit",
  "/Admin/Settings",
  "/Admin/Settings/Allergens",
  "/Admin/Settings/Allergens/Add",
  "/Admin/Settings/Allergens/Edit",
  "/Admin/Settings/Ingredients",
  "/Admin/Settings/Ingredients/Add",
  "/Admin/Settings/Ingredients/Edit",
  "/Admin/Settings/ProteinSources",
  "/Admin/Settings/ProteinSources/Add",
  "/Admin/Settings/ProteinSources/Edit",
];
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
   <Routes>
      <Route path="/" element={<Login />} />
      {adminPaths.map((path) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
    </>
  );
}

export default App;
