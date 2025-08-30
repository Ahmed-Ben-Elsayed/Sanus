import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import ReusableSelector from "../../ui/ReusableSelector";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import Loading from "../../ui/loading/LoadingOrder";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LoadingOrder from "../../ui/loading/LoadingOrder";
import NewButton from "../../ui/NewButton";
export const OrdersEdit = ({ active, setactive }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const OrderId = location.state?.orderId;

  const getById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setOrder(res.data.data.order);
      
    } catch (err) {
      console.log(err);
      toast.error("Error fetching order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (OrderId) {
      getById(OrderId);
    }
  }, [OrderId]);
useEffect(() => {
  if (order?.mealId?.dailyPlans) {
    const today = new Date().toDateString();

    const index = order.mealId.dailyPlans.findIndex((plan) => {
      const planDate = new Date(plan.date).toDateString();
      return planDate === today;
    });

    if (index !== -1) {
      setSelectedDateIndex(index);
    } else {
      setSelectedDateIndex(0);
    }
  }
}, [order]);
  if (loading) return <LoadingOrder />;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  // Prepare date options for selector
  const dateOptions = order?.mealId?.dailyPlans?.map((plan, index) => {
    const date = new Date(plan.date);
    return {
      value: index,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  }) || [];

  // Get meals for the selected day
  const getMealsForDay = () => {
    const selectedPlan = order.mealId?.dailyPlans?.[selectedDateIndex];
    if (!selectedPlan) return [];
    
    const meals = [];
    
    // Map meals to design format
    if (selectedPlan.meals.breakfast?.length > 0) {
      meals.push({
        type: "Breakfast",
        meal: selectedPlan.meals.breakfast[0].meal,
        timeWindow: selectedPlan.meals.breakfast[0].timeWindow,
        portion: selectedPlan.meals.breakfast[0].meal.nutritionalValues?.["Portion "] || ""
      });
    }
    
    if (selectedPlan.meals.lunch?.length > 0) {
      meals.push({
        type: "Lunch",
        meal: selectedPlan.meals.lunch[0].meal,
        timeWindow: selectedPlan.meals.lunch[0].timeWindow,
        portion: selectedPlan.meals.lunch[0].meal.nutritionalValues?.["Portion "] || ""
      });
    }
    
    if (selectedPlan.meals.dinner?.length > 0) {
      meals.push({
        type: "Dinner",
        meal: selectedPlan.meals.dinner[0].meal,
        timeWindow: selectedPlan.meals.dinner[0].timeWindow,
        portion: selectedPlan.meals.dinner[0].meal.nutritionalValues?.["Portion "] || ""
      });
    }
    
    if (selectedPlan.meals.snacks?.length > 0) {
      meals.push({
        type: "Snack",
        meal: selectedPlan.meals.snacks[0].meal,
        timeWindow: selectedPlan.meals.snacks[0].timeWindow,
        portion: "Snack"
      });
    }
    
    return meals;
  };
  
  const meals = getMealsForDay();
  
  // Get selected date for display
  const getSelectedDate = () => {
    const selectedPlan = order.mealId?.dailyPlans?.[selectedDateIndex];
    if (!selectedPlan) return "";
    
    return new Date(selectedPlan.date).toLocaleDateString("en-US", {
      month: "short",
      weekday: "short",
      day: "2-digit",
    }).replace(/ /g, "");
  };
  
  // Fix city name if needed
  const getCityName = () => {
    if (order.shippingAddress?.city === "cairp") {
      return "Cairo";
    }
    return order.shippingAddress?.city || "";
  };
const exportToExcel = () => {
  const data = meals.map((meal) => ({
    Type: meal.type,
    Portion: meal.portion,
    Name: meal.meal?.name || "",
    Description: meal.meal?.["Describtion "] || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Meals");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Order_${order._id}_Meals.xlsx`);
};
const groupDailyPlansByWeek = (plans, daysInWeek = 7) => {
  const result = [];
  for (let i = 0; i < plans.length; i += daysInWeek) {
    result.push(plans.slice(i, i + daysInWeek));
  }
  return result;
};

const dailyPlans = order?.mealId?.dailyPlans || [];
const weeks = groupDailyPlansByWeek(dailyPlans);
const currentWeek = Math.floor(selectedDateIndex / 7);

  return (
    <div className="p-0 pb-5 font-sans shadow-2xl h-[calc(100vh-77px)] overflow-y-auto bg-white rounded-xl overflow-x-hidden">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4 px-4 pt-4">
        <h2 className="text-lg ms-4 md:text-xl font-semibold flex items-center gap-1 text-[#7A83A3]">
          <IoIosArrowBack
            className="cursor-pointer"
            onClick={() => setactive("Restaurant Orders")}
          />
          More Details
        </h2>
        <NewButton onClick={()=>exportToExcel()} className="bg-[#476171] cursor-pointer text-[#E8E1DC] flex items-center justify-center gap-2 py-[7px] px-[15px] rounded-lg text-sm md:text-base">
          Export <MdOutlineFileDownload className="text-xl md:text-2xl" />
        </NewButton>
      </div>

      <hr className="bg-[#D1D1D1] border-none h-[1px] my-3 w-[100%] mx-auto" />

      {/* Date selector */}
      <div className="ms-9 mt-5">
        {/* <ReusableSelector 
          label={"Date"} 
          options={dateOptions}
          value={selectedDateIndex}
          onChange={(e) => setSelectedDateIndex(Number(e.target.value))}
          custclassName="bg-white text-[#476171!important]" 
          custclassNameArrow="text-[#476171!important]" 
          custclassNameItems="w-[100%!important] start-[0px!important]" 
        /> */}
      </div>
      
      {/* Meal table */}
      <div className="w-[94%] mt-5 mx-auto overflow-x-auto px-0">
        <table className="w-full rounded min-w-[1000px] border border-[#B0B0B0] text-center text-[#7B809A] text-sm">
          <thead>
            <tr>
              <th className="border border-[#B0B0B0] p-2 w-20"></th>
              <th className="border border-[#B0B0B0] p-2">
                {getSelectedDate()}
              </th>
              <th className="border border-[#B0B0B0] p-2">Description</th>
              <th className="border border-[#B0B0B0] p-2">Protein Type</th>
              <th className="border border-[#B0B0B0] p-2">Calories</th>
              <th className="border border-[#B0B0B0] p-2">Protein</th>
              <th className="border border-[#B0B0B0] p-2">Fat</th>
              <th className="border border-[#B0B0B0] p-2">Carbs</th>
            </tr>
          </thead>
          <tbody>
            {meals.length > 0 ? (
              meals.map((meal, index) => (
                <tr key={index}>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.type}
                    <p className="text-[#5f636a] mt-2">{meal.portion}</p>
                  </td>
                  <td className="border border-[#B0B0B0] p-2">
                    <img
                      src={"/food-7248455_1280.png"}
                      alt="Meal"
                      className="w-13 md:w-20 mx-auto mb-1"
                    />
                    <span className="text-xs md:text-sm">{meal.meal.name}</span>
                  </td>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.meal?.["Describtion "]}
                  </td>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.meal?.nutritionalValues?.["Portion "] }
                  </td>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.meal?.calories+"kcal"}
                  </td>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.meal?.nutritionalValues?.protein+"g" }
                  </td>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.meal?.nutritionalValues?.["Fat "] }
                  </td>
                  <td className="border text-[#344767] border-[#B0B0B0] p-2 font-medium">
                    {meal.meal?.nutritionalValues?.Carbs+"g" }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="border border-[#B0B0B0] p-4 text-[#344767]">
                  No meals scheduled for this day
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Notes table */}
      <div className="w-[94%] mt-7 mx-auto overflow-x-auto px-0">
        <table className="w-full min-w-[700px] text-sm border text-center">
          <thead className="border border-e-0 border-[#B0B0B0]">
            <tr className="text-[#7B809A] font-bold">
              <th className="border border-s-0 border-[#B0B0B0] px-2 md:px-4 py-2">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#B0B0B0] text-[#476171] font-semibold px-2 md:px-4 py-2">
                {order?.notes || "No notes provided"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Customer information */}
      <h2 className="my-5 ms-10 font-bold text-[#344767]">
        Customer Information
      </h2>
      <div className="w-[94%] mx-auto overflow-x-auto px-0">
        <table className="w-full min-w-[700px] text-sm border text-center">
          <thead className="border border-e-0 border-[#B0B0B0]">
            <tr className="text-[#7B809A] font-bold">
              <th className="border border-s-0 border-[#B0B0B0] px-2 md:px-4 py-2">
                Customer Name
              </th>
              <th className="border border-s-0 border-[#B0B0B0] px-2 md:px-4 py-2">
                Customer Phone
              </th>
              <th className="border border-s-0 border-[#B0B0B0] px-2 md:px-4 py-2">
                City
              </th>
              <th className="border border-s-0 border-[#B0B0B0] px-2 md:px-4 py-2">
                Package Name
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#B0B0B0] text-[#344767] font-bold px-2 md:px-4 py-2">
                {order?.user?.name}
              </td>
              <td className="border border-s-0 border-[#B0B0B0] text-[#476171] font-semibold px-2 md:px-4 py-2">
                {order?.shippingAddress?.phone}
              </td>
              <td className="border border-s-0 border-[#B0B0B0] text-[#476171] font-semibold px-2 md:px-4 py-2">
                {getCityName()}
              </td>
              <td className="border border-s-0 border-[#B0B0B0] text-[#476171] font-semibold px-2 md:px-4 py-2">
                {order?.items?.[0]?.package?.name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
         {/* Nutrition Summary - Only show if we have data */}
      {/* {weeks[currentWeek]?.length > 0 && (
  <div className="mx-4 mb-6">
      
      <h2 className="my-5 ms-7 font-bold text-[#344767]">        Customer Information
      Nutrition Summary (Week {currentWeek + 1})
      </h2>

    
    <div className="w-[96%] mx-auto overflow-x-auto">
      <table className="w-full border-[#B0B0B0] min-w-[600px] text-sm border text-center">
        <thead className="border border-[#B0B0B0]">
          <tr className="">
            <th className="px-4 py-2">Day</th>
            <th className="px-4 py-2">Calories</th>
            <th className="px-4 py-2">Protein (g)</th>
            <th className="px-4 py-2">Carbs (g)</th>
            <th className="px-4 py-2">Fat (g)</th>
          </tr>
        </thead>
        <tbody>
          {weeks[currentWeek].map((plan, index) => (
            <tr key={index}>
              <td className="px-4 py-2 font-medium">
                {new Date(plan.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td className="px-4 py-2">{plan.totalNutrition?.calories || 0}</td>
              <td className="px-4 py-2">{plan.totalNutrition?.protein || 0}</td>
              <td className="px-4 py-2">{plan.totalNutrition?.carbs || 0}</td>
              <td className="px-4 py-2">{plan.totalNutrition?.fat || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)} */}

    </div>
  );
};