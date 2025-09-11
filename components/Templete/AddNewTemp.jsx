import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import ReusableInput from "../../ui/ReuseInput";
import DayMealModal from "../../ui/DayMealModal";
import Loaderstart from "../../ui/loading/Loaderstart";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const days = ["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"];
const weeks = Array.from({ length: 4 }, (_, i) => `Week${i + 1}`);

const isSaturday = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay() === 6;
};

const getNextSaturday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = (6 - day + 7) % 7;
    today.setDate(today.getDate() + diff);
    return today.toISOString().split("T")[0];
};

const AddNewTemp = () => {
    const [Modal, setModal] = useState(false);
    const [day, setDay] = useState("");
    const [week, setWeek] = useState("");
    const [loading, setLoading] = useState(false);
    const [SavedMeals, setSavedMeals] = useState({});
    const location = useLocation();
    const TempleteId = location?.state?.TempleteId || null;
    const BaseUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [Temp, setTemp] = useState({
        Name: "",
        startDate: getNextSaturday(),
        breakfastOptionsCount: "",
        lunchDinnerOptionsCount: "",
        snacksAMOptionsCount: "",
        snacksPMOptionsCount: "",
    });

    const limits = {
        breakfast: Number(Temp.breakfastOptionsCount) || 0,
        lunch: Number(Temp.lunchDinnerOptionsCount) || 0,
        dinner: Number(Temp.lunchDinnerOptionsCount) || 0,
        snacksAM: Number(Temp.snacksAMOptionsCount) || 0,
        snacksPM: Number(Temp.snacksPMOptionsCount) || 0,
    };

    const dayNameMap = {
        SAT: "saturday",
        SUN: "sunday",
        MON: "monday",
        TUE: "tuesday",
        WED: "wednesday",
        THU: "thursday",
        FRI: "friday",
    };

    useEffect(() => {
        if (!TempleteId) return;

        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${BaseUrl}/template/templates/${TempleteId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                console.log(data);

                const template = data?.data.template || data;

                if (template) {
                    setTemp({
                        Name: template.name || "",
                        startDate: template.startDate ? template.startDate.split("T")[0] : getNextSaturday(),
                        breakfastOptionsCount: template.breakfastOptionsCount || "",
                        lunchDinnerOptionsCount: template.lunchDinnerOptionsCount || "",
                        snacksAMOptionsCount: template.snacksAMOptionsCount || "",
                        snacksPMOptionsCount: template.snacksPMOptionsCount || "",
                    });

                    let mealsObj = {};

                    if (template.weeks && Array.isArray(template.weeks)) {
                        template.weeks.forEach((week, i) => {
                            if (week.days && Array.isArray(week.days)) {
                                week.days.forEach((day) => {
                                    const dayKey = day.dayName ? day.dayName.toUpperCase().slice(0, 3) : "";

                                    if (dayKey && day.meals) {
                                        mealsObj[`Week${i + 1}-${dayKey}`] = {
                                            breakfast: day.meals.breakfast || [],
                                            lunch: day.meals.lunch || [],
                                            dinner: day.meals.dinner || [],
                                            snacksAM: day.meals.snacksAM || [],
                                            snacksPM: day.meals.snacksPM || [],
                                        };
                                    }
                                });
                            }
                        });
                    }

                    setSavedMeals(mealsObj);
                }
            } catch (err) {
                console.error("Error fetching template:", err);
                toast.error("Failed to fetch template ❌");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [TempleteId]);

    // 🟢 Add or Update
    const saveTemplate = async () => {
        if (!Temp.Name || !Temp.startDate) {
            toast.warning("Template name and start date are required ⚠️");
            return;
        }

        try {
            setLoading(true);

            const prepareMealsForAPI = (meals) => {
                return meals?.map(mealItem => {
                    if (mealItem.meal && typeof mealItem.meal === 'object') {
                        return {
                            meal: mealItem.meal._id,
                            isDefault: mealItem.isDefault || false
                        };
                    }
                    return {
                        meal: mealItem.meal || mealItem._id,
                        isDefault: mealItem.isDefault || false
                    };
                });
            };

            const payload = {
                name: Temp.Name,
                startDate: Temp.startDate,
                description: "خطة أكل متكاملة 4 أسابيع",
                breakfastOptionsCount: Number(Temp.breakfastOptionsCount) || 1,
                lunchDinnerOptionsCount: Number(Temp.lunchDinnerOptionsCount) || 1,
                snacksAMOptionsCount: Number(Temp.snacksAMOptionsCount) || 1,
                snacksPMOptionsCount: Number(Temp.snacksPMOptionsCount) || 1,
                weeks: weeks.map((weekName, i) => ({
                    weekNumber: i + 1,
                    days: days.filter((day) => day !== "FRI").map((day) => {
                        const savedMeals = SavedMeals[`${weekName}-${day}`] || {
                            breakfast: [],
                            lunch: [],
                            dinner: [],
                            snacksAM: [],
                            snacksPM: [],
                        };

                        return {
                            dayName: dayNameMap[day],
                            meals: {
                                breakfast: prepareMealsForAPI(savedMeals.breakfast),
                                lunch: prepareMealsForAPI(savedMeals.lunch),
                                dinner: prepareMealsForAPI(savedMeals.dinner),
                                snacksAM: prepareMealsForAPI(savedMeals.snacksAM),
                                snacksPM: prepareMealsForAPI(savedMeals.snacksPM),
                            },
                        };
                    }),
                })),
            };

            console.log("Payload being sent:", JSON.stringify(payload));

            let response;
            if (TempleteId) {
                // 🟠 Update
                response = await axios.put(`${BaseUrl}/template/templates/${TempleteId}`, {
                    name: Temp.Name,
                    description: "Sanus"
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                toast.success("Template updated successfully ✅");
            } else {
                // 🟢 Create new
                response = await axios.post(`${BaseUrl}/template`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                toast.success("Template saved successfully ✅");
            }

            navigate('/Admin/Templates', {
                state: {}
            });
        } catch (err) {
            console.error("Save error:", err);
            if (err) {
                console.log("Server response:", err);
                toast.error("Please Enter All Data ❌");
            } else {
                toast.error("Network error or server not responding ❌");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setTemp((prev) => ({ ...prev, [field]: value }));
    };

    const openModal = (day, week) => {
        if (day !== "FRI") {
            setDay(day);
            setWeek(week);
            setModal(true);
        }
    };

    return (
        <div className="shadow-sm rounded-xl overflow-auto w-full bg-white md:h-[calc(100vh-77px)] p-3 md:p-4 flex flex-col">
            {loading && <Loaderstart />}

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <IoIosArrowBack
                    className="cursor-pointer text-gray-400 text-xl"
                    onClick={() => {
                        navigate('/Admin/Templates', {
                            state: {}
                        });
                    }}
                />
                <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
                    {TempleteId ? "Edit Template" : "Add New Template"}
                </h2>
            </div>

            <hr className="border-gray-300 my-3" />

            {/* Inputs */}
            <div className="inputs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <div className="xl:col-span-1 lg:col-span-2 sm:col-span-1">
                    <ReusableInput
                        label="Template Name"
                        value={Temp.Name}
                        onChange={(e) => handleInputChange("Name", e.target.value)}
                        placeholder="Add Template Name"
                    />
                </div>
                
                <ReusableInput
                    label="Start Date (Day)"
                    value={Temp.startDate}
                    disabled={!!TempleteId}
                    type="date"
                    onChange={(e) => {
                        if (!isSaturday(e.target.value)) {
                            toast.error("Start date must be a Saturday 🗓️");
                            return;
                        }
                        handleInputChange("startDate", e.target.value);
                    }}
                />

                <ReusableInput
                    type="number"
                    custclassName="!pe-1"
                    disabled={!!TempleteId}
                    label="Number of Breakfast"
                    value={Temp.breakfastOptionsCount}
                    placeholder="Breakfast count"
                    onChange={(e) => handleInputChange("breakfastOptionsCount", e.target.value)}
                    min="1"
                />

                <ReusableInput
                    type="number"
                    custclassName="!pe-1"
                    disabled={!!TempleteId}
                    label="Number of Meals "
                    value={Temp.lunchDinnerOptionsCount}
                    placeholder="Meals count"
                    onChange={(e) => handleInputChange("lunchDinnerOptionsCount", e.target.value)}
                    min="1"
                />

                <ReusableInput
                    type="number"
                    custclassName="!pe-1"
                    label="Number of Snack AM"
                    value={Temp.snacksAMOptionsCount}
                    placeholder="Snack AM count"
                    disabled={!!TempleteId}

                    onChange={(e) => handleInputChange("snacksAMOptionsCount", e.target.value)}
                    min="1"
                />

                <ReusableInput
                    type="number"
                    custclassName="!pe-1"
                    label="Number of Snack PM"
                    value={Temp.snacksPMOptionsCount}
                    placeholder="Snack PM count"
                    disabled={!!TempleteId}
                    onChange={(e) => handleInputChange("snacksPMOptionsCount", e.target.value)}
                    min="1"
                />
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto pb-4">
                <div className="grid mt-4 grid-cols-[70px_repeat(7,minmax(80px,1fr))] md:grid-cols-[100px_repeat(7,minmax(90px,1fr))] gap-2 md:gap-3">
                    <div className="sticky left-0 z-10 bg-white"></div>
                    {days.map((day) => (
                        <div
                            key={day}
                            className="text-center font-semibold text-xs md:text-sm text-gray-600 p-1"
                        >
                            {day}
                        </div>
                    ))}

                    {weeks.map((weekName) => (
                        <React.Fragment key={weekName}>
                            <div className="flex items-center justify-center font-semibold text-gray-700 text-xs md:text-sm sticky left-0 z-10 bg-white p-1">
                                {weekName}
                            </div>

                            {days.map((day) => {
                                const saved = SavedMeals[`${weekName}-${day}`];
                                return (
                                    <div
                                        key={`${weekName}-${day}`}
                                        onClick={() => openModal(day, weekName)}
                                        className={`h-16 md:h-23  flex items-center justify-center rounded-lg border border-gray-300 cursor-pointer text-xs md:text-sm p-1   text-center ${day === "FRI"
                                            ? "bg-gray-400 text-white"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        {day === "FRI"
                                            ? ""
                                            : saved && (saved.breakfast.length > 0 || saved.lunch.length > 0 || saved.dinner.length > 0 || saved.snacksAM.length > 0 || saved.snacksPM.length > 0)
                                                ? <div className="flex font-semibold flex-col items-center gap-1 ">
                                                    {`${weekName}-${day}`}
                                                    <p className="font-normal text-gray-400 ">View Details</p>
                                                    <img className="w-6" alt="" srcSet="/saved.png" />
                                                </div>
                                                : 
                                                <div className="flex font-semibold flex-col items-center gap-1 ">
                                                    <p className="font-normal text-gray-400 ">More Details</p>
                                                    <p className="font-semibold text-[#476171] mt-1 bg-gray-200 px-3 rounded-2xl ">Select</p>
                                                </div>
                                        }
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Button */}
            <div className="mt-4 flex justify-end pb-4 md:pb-0">
                <button
                    onClick={saveTemplate}
                    className="bg-[#476171]  hover:bg-[#476171ee] cursor-pointer text-white px-6 py-3 md:px-10 md:py-2 rounded-lg w-full sm:w-auto"
                >
                    {TempleteId ? "Update" : "Confirm"}
                </button>
            </div>

            <DayMealModal
                week={week}
                day={day}
                templateId={TempleteId}
                limits={limits}
                isOpen={Modal}
                onClose={() => setModal(false)}
                defaultMeals={SavedMeals[`${week}-${day}`]}
                onSave={(week, day, meals) => {
                    setSavedMeals((prev) => ({ ...prev, [`${week}-${day}`]: meals }));
                    setModal(false);
                }}
            />
        </div>
    );
};

export default AddNewTemp;