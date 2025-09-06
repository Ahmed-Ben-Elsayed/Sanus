import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
// import { OrdersComponent } from "./onBoarding/OrdersComponent";
import { OnBoardingComponent } from "../onBoarding/OnBoardingComponent";
import EditPage from "../onBoarding/Editpage";
import { useLocation, useNavigate } from "react-router-dom";
import { Customers } from "../Customers/Customers";
import { CustomerInfo } from "../Customers/CustomerInfo";
import { Orders } from "../Orders/Orders";
import CreatePage from "../onBoarding/CreatePage";
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
import { AddNewPlan } from "../plans/AddNewPlane";
import { ViewMore } from "../plans/ViewMore";
import { Plan } from "../plans/Plan";
import { Packge } from "../packege/Packge";
import { RiLogoutCircleRFill } from "react-icons/ri";

import { AddNewpkg } from "../packege/AddNewpkg";
import Modal from "../../ui/Modal";
import Meals from "../Meals/Meals";
import AddMeals from "../Meals/AddMeals";
import Templete from "../Templete/Templete";
import AddNewTemp from "../Templete/AddNewTemp";
import Settings from "../settings/Settings";
import Allergens from "../settings/Allergens";
import AddAllergens from "../settings/AddAllergens";
import Ingredients from "../settings/Ingredients";
import AddIngredients from "../settings/AddIngredients";
import ProteinSource from "../settings/ProtineType/AddProtineSource";
import ProteinSources from "../settings/ProtineType/ProteinSources";
const DashBoard = ({ dark, toggledark }) => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("On Boarding");
  // const [currentSection, setCurrentSection] = useState("Settings");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [modal, setModal] = useState(false)
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
    return null;
  }
  const location = useLocation();
  const isCreating = location.pathname.includes("/Create");
  const logOut = () => {
    localStorage.clear()
    navigate('/')
    setModal(false)
  }
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />

      {/* Main Content Area */}
      <div className={` ${dark ? "bg-black transition-[1.5s] text-white " : ""} flex flex-col flex-1 px-4 py-4 overflow-y-auto`}>
        {/* Header */}
        <nav className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
          <h1 className={`text-xl ms-10 font-bold ${dark ? "text-white" : "text-[#344767]"} `}>
            {currentSection.includes("Orders")
              ? "Restaurant Orders"
              : currentSection.includes("Tracking Subscription")
                ? "Tracking Subscription"
                : currentSection}
          </h1>
          <div className="flex flex-col-reverse md:flex-row items-end  md:items-center justify-end gap-3 w-full md:w-[60%]">
            {/* <input
              type="text"
              placeholder="Search here"
              className="border border-[#acb4ba] outline-none placeholder:text-[#6E777C] text-sm rounded-lg w-full md:w-[70%] px-3 py-[5px]"
            /> */}
            {/* <Switch onclick={toggledark} checked={dark} /> */}
            <div className="flex items-center gap-2">
              <img
                src="/notification.png"
                alt="Notification"
                className="w-5 h-5 object-contain"
              />
              <span className={`text-sm font-bold   ${dark ? "text-white" : "text-[#344767]"}`}>
                Hi, {user?.name || "User"}!
              </span>
              <span onClick={() => setModal(true)} className="text-2xl font-bold text-[#344767]">
                <RiLogoutCircleRFill className={`cursor-pointer  ${dark ? "text-white" : "text-[#344767]"}`} />
              </span>
            </div>
          </div>
        </nav>

        {/* Main Page Content */}
        <div className={`flex-1 `}>
          {currentSection === "Account Customers" && (
            <Customers active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Tracking Subscription" && (
            <Tracking active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Add Note" && (
            <AddNote active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}

          {currentSection === "Freeze" && (
            <Freeze active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Add SupSubscription" && (
            <Orders active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Time Slot" && (
            <TimeSlot active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Change Address" && (
            <Orders active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Change Box" && (
            <ChangeBox active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Change Location" && (
            <ChangeLocation active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Timeslot" && (
            <Timeslot active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "add timeslot" && (
            <AddtimeSlot active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Customer Info" && (
            <CustomerInfo
              onBack={() => setCurrentSection("Account Customer")}
              setCurrentSection={setCurrentSection}
              currentSection={currentSection} dark={dark}
            />
          )}
          {currentSection === "Restaurant Orders" && (
            <Orders active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Plans" && (
            <Plan active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Templete" && (
            <Templete active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Add New Templete" && (
            <AddNewTemp active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Packges" && (
            <Packge active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Meals" && (
            <Meals active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Add New Meal" && (
            <AddMeals active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Add New Plan" && (
            <AddNewPlan active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Settings/Allergens/Add New Allergen" && (
            <AddAllergens active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Settings/Ingredients/Add New Ingredient" && (
            <AddIngredients active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Add New Packge" && (
            <AddNewpkg active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Settings" && (
            <Settings active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Settings/Allergens" && (
            <Allergens active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Settings/Ingredients" && (
            <Ingredients active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
         
          {currentSection === "Settings/Protein Sources" && (
            <ProteinSources active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Settings/Protein Sources/Add New Protein" && (
            <ProteinSource active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "View More" && (
            <ViewMore active={currentSection} dark={dark} setactive={setCurrentSection} />
          )}
          {currentSection === "Orders Edit" && (
            <OrdersEdit
              onBack={() => setCurrentSection("Orders")}
              active={currentSection}
              setactive={setCurrentSection} dark={dark}
            />
          )}
          {currentSection === "Tracking Subscription Edit" && (
            <TrackingDetails
              onBack={() => setCurrentSection("Tracking Subscription")}
              active={currentSection}
              setactive={setCurrentSection} dark={dark}
            />
          )}
          {currentSection === "On Boarding" && !isCreating && (
            <OnBoardingComponent
              active={currentSection}
              setactive={setCurrentSection} dark={dark}
            />
          )}
          {currentSection === "Edit Boarding" && !isCreating && (
            <EditPage
              onBack={() => setCurrentSection("On Boarding")}
              setCurrentSection={setCurrentSection}
              currentSection={currentSection} dark={dark}
            />
          )}
          {isCreating && (
            <CreatePage
              onBack={() => setCurrentSection("On Boarding")}
              setCurrentSection={setCurrentSection}
              currentSection={currentSection} dark={dark}
            />
          )}
        </div>
      </div>
      {modal && <Modal open={modal} onClose={() => setModal(false)} children={"Are You Sure Logout"} confirmText="Logout" cancelText="No" showActions onConfirm={() => logOut()} />}
    </div>
  );
};

export default DashBoard;
