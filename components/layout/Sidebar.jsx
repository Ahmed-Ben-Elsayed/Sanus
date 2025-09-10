import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const SidebarItem = ({ item, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded text-[15px] transition-all duration-300 ${
      isActive
        ? "bg-[#E8E1DC] text-[#2A414F] font-semibold"
        : "text-white hover:bg-[#1f323d]"
    }`}
  >
    <img className="w-5" src={isActive ? item.activeIcon : item.icon} alt={item.name} />
    <span>{item.name}</span>
  </li>
);

export const Sidebar = ({ dark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const pages = [
    { name: "On Boarding", url: "/Admin/On_Boarding", icon: "/noactive-sidebar-icons/Onboarding.png", activeIcon: "/active-icons-sidebar/Onboarding.png" },
    { name: "Account Customers", url: "/Admin/Account_Customers", icon: "/noactive-sidebar-icons/Customers.png", activeIcon: "/active-icons-sidebar/Customers.png" },
    { name: "Tracking Subscription", url: "/Admin/Tracking_Subscription", icon: "/noactive-sidebar-icons/Orders.png", activeIcon: "/active-icons-sidebar/Orders.png" },
    { name: "Restaurant Orders", url: "/Admin/Restaurant_Orders", icon: "/noactive-sidebar-icons/restaurant.png", activeIcon: "/active-icons-sidebar/restaurant.png" },
    { name: "Timeslot", url: "/Admin/Timeslot", icon: "/noactive-sidebar-icons/time.png", activeIcon: "/active-icons-sidebar/time.png" },
    { name: "Plans", url: "/Admin/Plans", icon: "/noactive-sidebar-icons/Plans.png", activeIcon: "/active-icons-sidebar/Plans.png" },
    { name: "Packges", url: "/Admin/Packages", icon: "/noactive-sidebar-icons/food.png", activeIcon: "/active-icons-sidebar/food.png" },
    { name: "Meals", url: "/Admin/Meals", icon: "/noactive-sidebar-icons/apple2.png", activeIcon: "/active-icons-sidebar/apple1.png" },
    { name: "Templete", url: "/Admin/Templates", icon: "/noactive-sidebar-icons/Plans.png", activeIcon: "/active-icons-sidebar/Plans.png" },
    { name: "Settings", url: "/Admin/Settings", icon: "/noactive-sidebar-icons/Setting.png", activeIcon: "/active-icons-sidebar/Setting.png" },
  ];

  const isItemActive = (itemUrl) => {
    return location.pathname.startsWith(itemUrl);
  };

  const renderList = (list) =>
    list.map((item) => {
      const isActive = isItemActive(item.url);
      return (
        <SidebarItem
          key={item.name}
          item={item}
          isActive={isActive}
          onClick={() => {
            navigate(item.url, { replace: true });
            setIsOpen(false);
          }}
        />
      );
    });

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`!absolute top-4 start-4 z-50 bg-[#476171] text-white p-2 rounded`}
        onClick={toggleSidebar}
      >
        {isOpen ? <IoClose className="cursor-pointer text-xl" /> : <FaBars className="cursor-pointer" />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-[#2A414F] sticky h-screen top-0 left-0 z-40 py-4 rounded-e-lg transition-all duration-500 ease-in-out ${
          isOpen ? "w-[70%] sm:w-[50%] overflow-auto md:w-[20%]" : "w-0 overflow-hidden"
        }`}
      >
        <img className="w-24 mx-auto" alt="Logo" src="/sidebarlogo.png" />

        <div className="pages my-4">
          <h3 className="text-white text-sm mb-3 ms-6">Pages</h3>
          <ul className="flex flex-col mx-auto w-[90%] gap-2">{renderList(pages)}</ul>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:opacity-0 z-[-1]"
        />
      )}
    </>
  );
};
