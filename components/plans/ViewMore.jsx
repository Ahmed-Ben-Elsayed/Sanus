import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useLocation } from 'react-router-dom';
import Loaderstart from '../../ui/loading/Loaderstart';

// Mock data in English
const mockPackage = {
  _id: "1",
  name: "Premium Fitness Package",
  description: "Complete meal plan for muscle building",
  numberOfDays: 7,
  price: 350,
  calories: 2000,
  numberOfMeals: 3,
  numberOfBreakfasts: 1,
  numberOfSnacks: 2,
  createdAt: "2023-10-01T10:00:00Z"
};

const mockDays = [
  "17 Sep, Tue",
  "18 Sep, Wed", 
  "19 Sep, Thu",
  "20 Sep, Fri",
  "21 Sep, Sat",
  "22 Sep, Sun"
];

const mockMeals = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack"
];

const mockDishes = {
  Breakfast: ["Vegetable Omelette", "Avocado Toast", "Greek Yogurt", "Smoothie Bowl", "Pancakes", "Scrambled Eggs"],
  Lunch: ["Grilled Chicken", "Salmon Fillet", "Quinoa Salad", "Beef Stir Fry", "Turkey Sandwich", "Veggie Wrap"],
  Dinner: ["Baked Fish", "Grilled Steak", "Pasta Primavera", "Chicken Curry", "Stuffed Peppers", "Lentil Soup"],
  Snack: ["Protein Shake", "Mixed Nuts", "Fruit Salad", "Protein Bar", "Cottage Cheese", "Dark Chocolate"]
};

export const ViewMore = ({ setactive }) => {
    const location = useLocation();
    const packageId = location?.state?.packageId;
    const basUrl = import.meta.env.VITE_API_BASE_URL;
    const [loading, setLoading] = useState(false);
    const [packageData, setPackageData] = useState(mockPackage);
    const [days, setDays] = useState(mockDays);
    const [meals, setMeals] = useState(mockMeals);

    const getPackageById = async (id) => {
        try {
            setLoading(true);
            const res = await axios.get(`${basUrl}/packageSchema/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPackageData(res.data.data || mockPackage);
            
            // Generate days based on package duration
            const duration = res.data.data?.numberOfDays || mockPackage.numberOfDays;
            const daysArray = [];
            const startDate = new Date();
            
            for (let i = 0; i < duration; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                daysArray.push(date.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    weekday: 'short'
                }));
            }
            setDays(daysArray);

            // Set meals based on package configuration
            const mealTypes = [];
            if (res.data.data?.numberOfBreakfasts > 0 || mockPackage.numberOfBreakfasts > 0) mealTypes.push('Breakfast');
            if (res.data.data?.numberOfMeals > 0 || mockPackage.numberOfMeals > 0) mealTypes.push('Lunch', 'Dinner');
            if (res.data.data?.numberOfSnacks > 0 || mockPackage.numberOfSnacks > 0) mealTypes.push('Snack');
            setMeals(mealTypes);

        } catch (err) {
            console.log(err);
            // Fallback to mock data if API fails
            setPackageData(mockPackage);
            setDays(mockDays);
            setMeals(mockMeals);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (packageId) {
            getPackageById(packageId);
        } else {
            // Use mock data if no packageId is provided
            setPackageData(mockPackage);
            setDays(mockDays);
            setMeals(mockMeals);
        }
    }, [packageId]);

    const getRandomDish = (mealType, dayIndex) => {
        const dishes = mockDishes[mealType];
        return dishes[dayIndex % dishes.length];
    };

    return (
        <div className="shadow-sm rounded-xl w-full bg-white h-[calc(100vh-77px)] flex flex-col p-4">
            {loading && <Loaderstart />}
            
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <IoIosArrowBack
                    className="cursor-pointer text-[#7A83A3] text-xl"
                    onClick={() => setactive("Add New Plan")}
                />
                <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
                    {packageData?.name || 'View Menu'}
                </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Package Info Summary (Mobile) */}
            <div className="md:hidden bg-gray-50 p-3 rounded-lg mb-4">
                <h3 className="font-medium text-[#374151] mb-2">Package Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-gray-500">Duration:</span> {packageData?.numberOfDays} days
                    </div>
                    <div>
                        <span className="text-gray-500">Price:</span> ${packageData?.price}
                    </div>
                    <div>
                        <span className="text-gray-500">Calories:</span> {packageData?.calories}/day
                    </div>
                    <div>
                        <span className="text-gray-500">Meals:</span> {packageData?.numberOfMeals} main
                    </div>
                </div>
            </div>

            {/* Meal Plan Table */}
            {days.length > 0 && meals.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full border border-[#E0E0E0]">
                        <thead className="bg-[#F9FAFB]">
                            <tr>
                                <th className="border border-[#E0E0E0] px-3 py-2 text-[#374151] font-medium sticky left-0 bg-[#F9FAFB] z-10">
                                    Meal
                                </th>
                                {days.map((day, idx) => (
                                    <th key={idx} className="border border-[#E0E0E0] px-3 py-2 text-[#374151] font-medium min-w-[120px]">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {meals.map((meal, i) => (
                                <tr key={i}>
                                    <td className="border border-[#E0E0E0] px-3 py-2 font-medium text-[#374151] bg-[#FAFAFA] sticky left-0 z-10">
                                        {meal}
                                    </td>
                                    {days.map((_, j) => (
                                        <td key={j} className="border border-[#E0E0E0] p-2">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded mb-1 flex items-center justify-center">
                                                    <span className="text-xs">
                                                        {meal === "Breakfast" ? "🍳" : 
                                                         meal === "Lunch" ? "🍲" : 
                                                         meal === "Dinner" ? "🍽️" : "🥗"}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-[#4B5563] text-center line-clamp-1">
                                                    {getRandomDish(meal, j)}
                                                </span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    {loading ? 'Loading meal plan...' : 'No meal plan data available'}
                </div>
            )}

           
        </div>
    );
};