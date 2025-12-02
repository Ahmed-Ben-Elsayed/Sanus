import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";

// === Helper: Format date to day name ===
const formatDateToDay = (dateString) => {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const date = new Date(dateString);
  return days[date.getDay()];
};

export const TrackingDetails = () => {
  const [order, setOrder] = useState(null);
  const [weekData, setWeekData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const OrderId = location.state?.orderId;

  // === Fetch Order by Id ===
  const getById = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setOrder(res.data.data.order);

      if (res.data.data.order?.MealPlan?.dailyPlans) {
        const daysData = res.data.data.order.MealPlan.dailyPlans.map((day) => ({
          date: day.date,
          dayName: formatDateToDay(day.date),
          meals: day.meals,
          totalNutrition: day.totalNutrition,
        }));

        setWeekData(daysData);
        setCurrentWeek(0);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error("Failed to load order details");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (OrderId) getById(OrderId);
  }, [OrderId]);

  // === Split days into weeks (7 days each) ===
  const weeks = [];
  for (let i = 0; i < weekData.length; i += 7) {
    weeks.push(weekData.slice(i, i + 7));
  }

  // === Format address ===
  const formatAddress = (address) => {
    if (!address) return "No address provided";
    return `${address.street}, ${address.city}, ${address.country}`;
  };

  // === Meal Types ===
  const mealTypes = ["breakfast", "lunch", "dinner", "snacksAM", "snacksPM"];

  // === Export to Excel ===
  const exportToExcel = () => {
    const sheetData = [
      ["Date", "Day", "Meal Type", "Meal Name" , "Protein", "Carbs", "Fats", "Start Time", "End Time"],
    ];

    weeks[currentWeek].forEach((day) => {
      const date = new Date(day.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "2-digit",
      });

      mealTypes.forEach((mealType) => {
        const meals = day.meals[mealType] || [];
        if (meals.length > 0) {
          meals.forEach((m) => {
            sheetData.push([
              new Date(day.date).toLocaleDateString("en-GB"), // Date
              formatDateToDay(day.date), // Day name
              mealType.charAt(0).toUpperCase() + mealType.slice(1), // Meal Type
              m?.meal?.name || "Custom Meal", // Meal Name
              m?.meal?.nutritionalValues?.protein || "-", // Protein
              m?.meal?.nutritionalValues?.carbs || "-", // Carbs
              m?.meal?.nutritionalValues?.fat || "-", // Fats
              m?.timeWindow?.start || "-", // Start Time
              m?.timeWindow?.end || "-", // End Time
            ]);
          });
        } else {
          sheetData.push([
            new Date(day.date).toLocaleDateString("en-GB"),
            formatDateToDay(day.date),
            mealType.charAt(0).toUpperCase() + mealType.slice(1),
            "No Meal",
            "-", "-", "-", "-",
            "-", "-",
          ]);
        }
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet["!cols"] = [
      { wch: 12 }, // Date
      { wch: 12 }, // Day
      { wch: 15 }, // Meal Type
      { wch: 25 }, // Meal Name
      { wch: 10 }, // Protein
      { wch: 10 }, // Carbs
      { wch: 10 }, // Fats
      { wch: 12 }, // Start Time
      { wch: 12 }, // End Time
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Week ${currentWeek + 1}`);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, `MealPlan_Week${currentWeek + 1}.xlsx`);
  };


  // === Loading State ===
  if (isLoading) return <Loaderstart />;

  // === If Order not found ===
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="mt-4 text-lg font-medium text-[#476171]">
          Order Not Found
        </h3>
        <p className="mt-2 text-center text-gray-500">
          We couldn't find the subscription details for this order.
        </p>
        <button
          onClick={() => navigate("/Admin/Tracking_Subscription",{state:{}})}
          className="mt-4 px-4 py-2 bg-[#476171] text-white rounded-md hover:bg-[#3a515e]"
        >
          Back to Subscriptions
        </button>
      </div>
    );
  }

  return (
    <div className="p-0 pb-5 font-sans shadow-2xl h-[calc(100vh-77px)] overflow-y-auto bg-white rounded-xl overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4 px-4 pt-4">
        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1 text-[#7A83A3]">
          <IoIosArrowBack
            className="cursor-pointer"
            onClick={() =>{  navigate("/Admin/Tracking_Subscription",{state:{}}) }}
          />
          Subscription Details
        </h2>
        <NewButton
          onClick={exportToExcel}
          className="bg-[#476171] cursor-pointer text-[#E8E1DC] flex items-center gap-2 py-[7px] px-[15px] rounded-lg text-sm md:text-base hover:bg-[#3a515e] transition-colors"
          icon={MdOutlineFileDownload}
        >
          Export to Excel
        </NewButton>
      </div>

      <hr className="bg-[#D1D1D1] border-none h-[1px] my-3 w-[98%] mx-auto" />

      {/* Weeks Navigation */}
      {weeks.length > 1 && (
        <div className="flex justify-between items-center my-4 px-4">
          <button
            disabled={currentWeek === 0}
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className={`px-4 py-2 rounded-md ${
              currentWeek === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#476171] text-white hover:bg-[#3a515e]"
            }`}
          >
            Previous Week
          </button>

          <div className="text-[#476171] font-semibold">
            Week {currentWeek + 1} of {weeks.length}
          </div>

          <button
            disabled={currentWeek === weeks.length - 1}
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className={`px-4 py-2 rounded-md ${
              currentWeek === weeks.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#476171] text-white hover:bg-[#3a515e]"
            }`}
          >
            Next Week
          </button>
        </div>
      )}

      {/* Meals Table */}
      <div className="w-full mt-5 mb-6">
        {weeks.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
            <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h4 className="text-lg font-medium text-gray-700">
              No Meal Plan Available
            </h4>
            <p className="mt-1 text-gray-500">
              This subscription doesn't have a meal plan configured yet.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full min-w-[700px] border border-s-0 border-e-0 border-[#B0B0B0] text-center text-[#7B809A] text-sm">
              <thead>
                <tr className="border-s-0 border-e-0">
                  <th className="border border-[#B0B0B0] border-s-0 border-e-0 p-2 w-20"></th>
                  {weeks[currentWeek]?.map((day, index) => (
                    <th key={index} className="border border-[#B0B0B0] border-e-0 p-2">
                      <span className="text-xs text-gray-500">
                        {new Date(day?.date)
                          .toLocaleDateString("en-US", {
                            month: "short",
                            weekday: "short",
                            day: "2-digit",
                          })
                          .replace(/ /g, "")}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealTypes.map((mealType, i) => (
                  <tr key={i}>
                    <td className="border border-s-0 text-[#344767] border-[#B0B0B0] p-2 font-medium capitalize">
                      {mealType}
                    </td>
                    {weeks[currentWeek]?.map((day, dayIndex) => {
                      const meals = day.meals[mealType];
                      const firstMeal = meals?.length > 0 ? meals[0] : null;
                      return (
                        <td key={dayIndex} className="border border-e-0 border-[#B0B0B0] p-2">
                          {firstMeal ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={firstMeal.meal?.imageUrl || "/food-7248455_1280.png"}
                                className="w-14 h-14 object-cover rounded-full mb-1 shadow"
                              />
                              <span className="text-xs md:text-sm font-medium text-[#344767] text-center">
                                {firstMeal.meal?.name || "Custom Meal"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No meal</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Information */}
      <div className="w-full overflow-x-auto  px-0">
        <table className="w-full mt-6 min-w-[700px] text-sm border-[#7B809A] border border-s-0 border-e-0   text-center">
          <thead>
            <tr className="text-[#7B809A]  font-bold">
              <th className="px-2 md:px-4 py-2"></th>
              <th className="px-2 md:px-4 py-2">Location</th>
              <th className="px-2 md:px-4 py-2">Building</th>
              <th className="px-2 md:px-4 py-2">Floor</th>
              <th className="px-2 md:px-4 py-2">Additional Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[#344767] font-bold px-2 md:px-4 py-2">Address</td>
              <td className="text-[#476171] font-semibold px-2 md:px-4 py-2">
                {formatAddress(order.shippingAddress)}
              </td>
              <td className="text-[#476171] font-semibold px-2 md:px-4 py-2">
                {order.shippingAddress?.building || "N/A"}
              </td>
              <td className="text-[#476171] font-semibold px-2 md:px-4 py-2">
                {order.shippingAddress?.floor || "N/A"}
              </td>
              <td className="text-[#476171] font-semibold px-2 md:px-4 py-2">
                Phone: {order.shippingAddress?.phone || "N/A"} <br />
                Location: {formatAddress(order.shippingAddress)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Information */}
      <div className="w-full overflow-x-auto px-0">
        <table className="w-full mt-6 min-w-[600px] border-[#7B809A] border-s-0 border-e-0 text-sm border text-center">
          <thead>
            <tr>
              <th className="px-4 py-2 text-[#7B809A] font-bold">Payment Method</th>
              <th className="px-4 py-2 text-[#7B809A] font-bold">Timeslot</th>
              <th className="px-4 py-2 text-[#7B809A] font-bold">Payment Status</th>
              <th className="px-4 py-2 text-[#7B809A] font-bold">Box</th>
              <th className="px-4 py-2 text-[#7B809A] font-bold">Promo Code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 text-[#476171] font-semibold">
                {order.paymentMethod || "Credit Card"}
              </td>
              <td className="px-4 py-3 text-[#476171] font-semibold">
                {order?.time_slot?.value || "-"}
              </td>
              <td className="px-4 py-3 text-[#476171] font-semibold">
                {order.paymentStatus || "N/A"}
              </td>
              <td className="px-4 py-3 text-[#476171] font-semibold">
                {order?.items?.[0]?.quantity || "-"}
              </td>
              <td className="px-4 py-3 text-[#476171] font-semibold">
                {order?.promo_code || "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
