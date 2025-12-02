import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiLogoutCircleRFill } from "react-icons/ri";

import { Sidebar } from "./Sidebar";
import Modal from "../../ui/Modal";
import { motion } from "framer-motion";
// Main Components
import { OnBoardingComponent } from "../onBoarding/OnBoardingComponent";
import EditPage from "../onBoarding/Editpage";
import CreatePage from "../onBoarding/CreatePage";
import { Customers } from "../Customers/Customers";
import { CustomerInfo } from "../Customers/CustomerInfo";
import { Orders } from "../Orders/Orders";
import { AddNote } from "../Orders/AddNote";
import { Freeze } from "../Tracking/Freeze";
import { TimeSlot } from "../Tracking/TimeSlot";
import { OrdersEdit } from "../Orders/OrdersEdit";
import { Tracking } from "../Tracking/Tracking";
import { TrackingDetails } from "../Tracking/TrackingDetails";
import { ChangeBox } from "../Tracking/ChangeBox";
import { Timeslot } from "../Timeslot/Timeslot";
import { AddtimeSlot } from "../Timeslot/AddtimeSlot";
import { ChangeLocation } from "../Tracking/ChangeLocation";
import { Plan } from "../plans/Plan";
import { Packge } from "../packege/Packge";
import Meals from "../Meals/Meals";
import Templete from "../Templete/Templete";
import Settings from "../settings/Settings";
import Allergens from "../settings/Allergens";
import Ingredients from "../settings/Ingredients";
import ProteinSources from "../settings/ProtineType/ProteinSources";
import AddAllergens from "../settings/AddAllergens";
import AddIngredients from "../settings/AddIngredients";
import AddMeals from "../Meals/AddMeals";
import AddNewTemp from "../Templete/AddNewTemp";
// Named Exports (AddNew… components)
import { AddNewPlan } from "../plans/AddNewPlane";
import { AddNewpkg } from "../packege/AddNewpkg";
import ProteinSource from "../settings/ProtineType/AddProtineSource";
import Loaderstart from "../../ui/loading/Loaderstart";

const pathComponents = {
  "/Admin/On_Boarding": OnBoardingComponent,
  "/Admin/On_Boarding/CreatePage": CreatePage,
  "/Admin/Account_Customers": Customers,
  "/Admin/Account_Customers/moreInfo": CustomerInfo,
  "/Admin/Tracking_Subscription": Tracking,
  "/Admin/Tracking_Subscription/Add": AddNote,
  "/Admin/Tracking_Subscription/Change_Location": ChangeLocation,
  "/Admin/Tracking_Subscription/moreinfo": TrackingDetails,
  "/Admin/Tracking_Subscription/time_slot": TimeSlot,
  "/Admin/Tracking_Subscription/Change_Box": ChangeBox,
  "/Admin/Tracking_Subscription/scheduled_freeze": Freeze,
  "/Admin/Restaurant_Orders": Orders,
  "/Admin/Restaurant_Orders/add_note": AddNote,
  "/Admin/Restaurant_Orders/moreinfo": OrdersEdit,
  "/Admin/Timeslot": Timeslot,
  "/Admin/Timeslot/Add": AddtimeSlot,
  "/Admin/Timeslot/Edit": AddtimeSlot,
  "/Admin/Plans": Plan,
  "/Admin/Plans/Add": AddNewPlan,
  "/Admin/Plans/Edit": AddNewPlan,
  "/Admin/Packages": Packge,
  "/Admin/Packages/Add": AddNewpkg,
  "/Admin/Packages/Edit": AddNewpkg,
  "/Admin/Meals": Meals,
  "/Admin/Meals/Add": AddMeals,
  "/Admin/Meals/Edit": AddMeals,
  "/Admin/Templates": Templete,
  "/Admin/Templates/Add": AddNewTemp,
  "/Admin/Templates/Edit": AddNewTemp,
  "/Admin/Settings": Settings,
  "/Admin/Settings/Allergens": Allergens,
  "/Admin/Settings/Allergens/Add": AddAllergens,
  "/Admin/Settings/Allergens/Edit": AddAllergens,
  "/Admin/Settings/Ingredients": Ingredients,
  "/Admin/Settings/Ingredients/Add": AddIngredients,
  "/Admin/Settings/Ingredients/Edit": AddIngredients,
  "/Admin/Settings/ProteinSources": ProteinSources,
  "/Admin/Settings/ProteinSources/Add":   ProteinSource,
  "/Admin/Settings/ProteinSources/Edit":   ProteinSource,
};

const DashBoard = ({ dark, toggledark }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [modal, setModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  if (checkingAuth) {
    return "";
  }

  const logOut = () => {
    localStorage.clear();
    navigate("/");
    setModal(false);
  };

  let ComponentToRender = pathComponents[location.pathname];

  if (location.pathname.startsWith("/Admin/On_Boarding/") && !location.pathname.endsWith("CreatePage")) {
    ComponentToRender = EditPage;
  }

  return (
    <div className="flex min-h-screen ">
      {/* Sidebar */}
      <Sidebar dark={dark} />

      {/* Main Content */}
      <div className={`flex-1 px-4 py-4   overflow-y-auto ${dark ? "bg-black text-white transition-[1.5s]" : ""}`}>
        {/* Header */}
        <nav className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
          <h1 className={`text-xl ms-10 font-bold ${dark ? "text-white" : "text-[#344767]"}`}>
            {location.pathname.split("/").slice(-1)[0].replace(/_/g, " ")}
          </h1>
          <div className="flex items-center gap-2">
            <img src="/notification.png" alt="Notification" className="w-5 h-5 object-contain" />
            <span className={`text-sm font-bold ${dark ? "text-white" : "text-[#344767]"}`}>
              Hi, {user?.name || "User"}!
            </span>
            <span onClick={() => setModal(true)} className="text-2xl cursor-pointer">
              <RiLogoutCircleRFill className={`${dark ? "text-white" : "text-[#344767]"}`} />
            </span>
          </div>
        </nav>

        {/* Page Component */}
        <div className="flex-1 ">
          {ComponentToRender ? (
            <ComponentToRender dark={dark} />
          ) : (
            <div className="flex flex-col min-h-[calc(100vh-77px)] items-center justify-center rounded bg-[#385263] text-white px-4">
              {/* Animation for 404 number */}
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-9xl font-extrabold tracking-widest text-[#E8E1DC]"
              >
                404
              </motion.h1>

              {/* Page not found text */}
              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-4 text-2xl md:text-3xl font-semibold"
              >
                Page Not Found
              </motion.p>

              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-2 text-gray-300 text-center max-w-md"
              >
                Sorry, the page you are looking for doesn’t exist or has been moved.
              </motion.p>

              {/* Button back to home */}
              <motion.button
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                onClick={() => navigate("/Admin/On_Boarding")}
                className="mt-6 px-6 py-3 bg-[#E8E1DC] cursor-pointer text-[#2A414F] rounded-2xl font-semibold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                Back to Home
              </motion.button>
            </div>
          )}
        </div>
      </div>
      {/* Logout Modal */}
      {modal && (
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          children={"Are You Sure Logout"}
          confirmText="Logout"
          cancelText="No"
          showActions
          onConfirm={logOut}
        />
      )}
    </div>
  );
};

export default DashBoard;
