import React, { useState } from "react";
import { FaBars, FaClosedCaptioning, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { SlClose } from "react-icons/sl";
import { IoClose } from "react-icons/io5";
const SidebarItem = ({ item, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded text-[15px] transition-all duration-300 ${isActive
        ? "bg-[#E8E1DC] text-[#2A414F] font-semibold"
        : "text-white hover:bg-[#1f323d]"
      }`}
  >
    <img className="w-5" src={isActive ? item.activeIcon : item.icon} alt={item.name} />
    <span>{item.name}</span>
  </li>
);

export const Sidebar = ({ currentSection, setCurrentSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // قائمة الصفحات
  const pages = [
    { name: "On Boarding", icon: "/noactive-sidebar-icons/Onboarding.png", activeIcon: "/active-icons-sidebar/Onboarding.png" },
    { name: "Account Customers", icon: "/noactive-sidebar-icons/Customers.png", activeIcon: "/active-icons-sidebar/Customers.png" },
    { name: "Tracking Subscription", icon: "/noactive-sidebar-icons/Orders.png", activeIcon: "/active-icons-sidebar/Orders.png" },
    { name: "Restaurant Orders", icon: "/noactive-sidebar-icons/restaurant.png", activeIcon: "/active-icons-sidebar/restaurant.png" },
    { name: "Timeslot", icon: "/noactive-sidebar-icons/time.png", activeIcon: "/active-icons-sidebar/time.png" },
    { name: "Plans", icon: "/noactive-sidebar-icons/Plans.png", activeIcon: "/active-icons-sidebar/Plans.png" },
    { name: "Packges", icon: "/noactive-sidebar-icons/food.png", activeIcon: "/active-icons-sidebar/food.png" },
    { name: "Meals", icon: "/noactive-sidebar-icons/apple2.png", activeIcon: "/active-icons-sidebar/apple1.png" },
    { name: "Templete", icon: "/noactive-sidebar-icons/Plans.png", activeIcon: "/active-icons-sidebar/Plans.png" },
    { name: "Settings", icon: "/noactive-sidebar-icons/Setting.png", activeIcon: "/active-icons-sidebar/Setting.png" },
    // { name: "Consultation", icon: "/noactive-sidebar-icons/Consultation.png", activeIcon: "/active-icons-sidebar/Consultation.png" },
    // { name: "Status", icon: "/noactive-sidebar-icons/Status.png", activeIcon: "/active-icons-sidebar/Status.png" },
  ];

  // قائمة الإجراءات
  const actions = [
    // { name: "Discount Code", icon: "/noactive-sidebar-icons/DiscountCode.png", activeIcon: "/active-icons-sidebar/DiscountCode.png" },
    // { name: "Notifications", icon: "/noactive-sidebar-icons/Notification.png", activeIcon: "/active-icons-sidebar/Notification.png" },
  ];

  const isItemActive = (itemName) => {
    const mapping = {
      "On Boarding": ["On Boarding", "Edit Boarding"],
      "Account Customers": ["Account Customers", "Customer Info"],
      "Restaurant Orders": ["Restaurant Orders", "Orders Edit", "Add Note"],
      "Tracking Subscription": [
        "Tracking Subscription",
        "Tracking Subscription Edit",
        "Tracking Subscription Add Note",
        "Freeze",
        "Add SupSubscription",
        "Time Slot",
        "Change Location",
        "Change Box",
      ],
        "Templete":["Add New Templete","Templete"],
        "Meals":['Add New Meal','Meals'],
      "Timeslot": ["Timeslot", "add timeslot"],
      "Plans": ["Plans", "Add New Plan", "View More"],
      "Packges": ["Add New Packge", "Packges"],
      "Settings": ["Settings","Settings/Allergens","Settings/Allergens/Add New Allergen","Settings/Ingredients","Settings/Ingredients/Add New Ingredient","Settings/Protein Sources","Settings/Protein Sources/Add New Protein"],
    };

    return mapping[itemName]?.includes(currentSection) || currentSection === itemName;
  };

  // عرض القائمة
  const renderList = (list) =>
    list.map((item) => {
      const isActive = isItemActive(item.name);
      return (
        <SidebarItem
          key={item.name}
          item={item}
          isActive={isActive}
          onClick={() => {
            setCurrentSection(item.name);
            setIsOpen(false);
            navigate("/Admin", { replace: true });
          }}
        />
      );
    });

  return (
    <>
      <button
        className={`!absolute top-4 start-4 z-50 ${isOpen ? " bg-[#476171]" : "bg-[#476171] " } text-white p-2 rounded`}
        onClick={toggleSidebar}
      >
        {isOpen ? <IoClose   className="cursor-pointer text-xl text-[]"  /> : <FaBars className="cursor-pointer" />}
      </button>

      <div
        className={`bg-[#2A414F] sticky h-screen top-0 left-0 z-40 py-4 rounded-e-lg transition-all duration-500 ease-in-out
        ${isOpen ? "w-[70%] sm:w-[50%] overflow-auto md:w-[20%]" : "w-0 overflow-hidden"}`}
      >
        <img className="w-24 mx-auto" alt="Logo" src="/sidebarlogo.png" />

        <div className="pages my-4">
          <h3 className="text-white text-sm mb-3 ms-6">Pages</h3>
          <ul className="flex flex-col mx-auto w-[90%] gap-2">{renderList(pages)}</ul>
        </div>

        <div className="pages my-4">
          {/* <h3 className="text-white text-sm mb-3 ms-6">Actions</h3> */}
          <ul className="flex flex-col mx-auto w-[90%] gap-2">{renderList(actions)}</ul>
        </div>
      </div>

      {isOpen && (
        <div  
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:opacity-0 z-[-1]"
        />
      )}
    </>
  );
};
