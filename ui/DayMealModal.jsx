import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoSwapVertical,
  IoInformationCircle,
  IoChevronDown,
} from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { data } from "react-router-dom";

// === Constants ===
const mealsCategories = [
  { key: "breakfast", label: "Breakfast", icon: "🥐" },
  { key: "lunch", label: "Lunch", icon: "🍲" },
  { key: "dinner", label: "Dinner", icon: "🍽️" },
  { key: "snacksAM", label: "AM Snack", icon: "☕" },
  { key: "snacksPM", label: "PM Snack", icon: "🍎" },
];

const dayMap = {
  sat: "saturday",
  sun: "sunday",
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  fri: "friday",
};

const CustomSelect = ({ options, value, onChange, placeholder, className, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-left focus:outline-none focus:ring-2 focus:ring-[#476171] focus:border-[#476171] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IoChevronDown
          className={`text-[#476171] transition-transform ${isOpen && !disabled ? "rotate-180  cursor-pointer" : " cursor-not-allowed"
            }`}
        />
      </button>
      {(isOpen && (!disabled)) && (
        <div className={`absolute z-10 mt-1 ${disabled ? "cursor-not-allowed" : ""} h-[300px] w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-72 overflow-auto`}>
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meals..."
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#476171]"
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-[#f0f4f7] transition-colors ${value === option.value
                  ? "bg-[#f0f4f7] text-[#476171] font-medium"
                  : "text-gray-700"
                  }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-400 text-sm">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

// === Main Component ===
const DayMealModal = ({
  templateId,
  week,
  day,
  limits,
  onSave,
  onClose,
  isOpen,
  defaultMeals,
}) => {
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacksAM: [],
    snacksPM: [],
  });

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [mealToReplace, setMealToReplace] = useState(null);

  const BaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isOpen) {
      getAllMeals();
      if (defaultMeals) {
        const processedMeals = {};
        Object.keys(defaultMeals).forEach((category) => {
          processedMeals[category] = defaultMeals[category].map((mealItem) => {
            if (mealItem.meal && typeof mealItem.meal === "object") {
              return {
                meal: mealItem.meal._id,
                name: mealItem.meal.name,
                nameAr: mealItem.meal.nameAr || "",
                isDefault: mealItem.isDefault || false,
              };
            }
            return {
              meal: mealItem.meal || mealItem._id,
              name: mealItem.name || "Unknown Meal",
              isDefault: mealItem.isDefault || false,
            };
          });
        });
        setSelectedMeals(processedMeals);
      }
    }
  }, [defaultMeals, day, week, isOpen]);

  // === Handlers ===
  const getAllMeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";

      let page = 1;
      const limit = 1000000;
      let totalPages = 1;
      const collected = [];

      do {
        const { data } = await axios.get(`${BaseUrl}/meals`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit },
        });

        const apiMeals = data?.data?.meals ?? data?.meals ?? [];
        collected.push(...apiMeals);

        const apiPagination = data?.data?.pagination ?? data?.pagination ?? {};
        const currentPage = Number(apiPagination.currentPage) || page;
        const apiTotalPages = Number(apiPagination.totalPages);

        if (apiTotalPages) {
          totalPages = apiTotalPages;
        } else {
          if (apiMeals.length < limit) {
            totalPages = currentPage;
          }
        }

        page = currentPage + 1;
      } while (page <= totalPages);

      const uniqueMeals = Object.values(
        collected.reduce((acc, m) => {
          if (m && m._id) acc[m._id] = m;
          return acc;
        }, {})
      );

      setMeals(uniqueMeals);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch meals");
    } finally {
      setLoading(false);
    }
  };


  const handleReplaceMeal = async (category, oldMealId, newMealId) => {
    if (!newMealId || oldMealId === newMealId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const payload = {
        weekNumber: Number(week.replace("Week", "")),
        dayName: dayMap[day.toLowerCase()] || day.toLowerCase(),
        mealType: category,
        oldMealId,
        newMealId,
      };
      await axios.put(
        `${BaseUrl}/template/templates/${templateId}/replace-meal`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedMeals((prev) => ({
        ...prev,
        [category]: prev[category].map((m) =>
          m.meal === oldMealId
            ? {
              ...m,
              meal: newMealId,
              name:
                meals.find((opt) => opt._id === newMealId)?.name ||
                "Updated Meal",
            }
            : m
        ),
      }));

      toast.success("Meal replaced successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to replace meal");
    } finally {
      setLoading(false);
    }
  };
  console.log(meals);

  const handleAddMeal = (category, mealId) => {
    if (!mealId) return;
    if (selectedMeals[category].length >= (limits[category] || 0)) {
      toast.error(
        `You can only add up to ${limits[category]} items for ${category}`
      );
      return;
    }

    const mealObj = meals.find((opt) => opt._id === mealId);
    if (!mealObj) return toast.error("Selected meal not found");

    if (!selectedMeals[category].some((m) => m.meal === mealId)) {
      setSelectedMeals({
        ...selectedMeals,
        [category]: [
          ...selectedMeals[category],
          { meal: mealId, name: mealObj.name, isDefault: false },
        ],
      });
      setSelectedCategory({ ...selectedCategory, [category]: "" });
    } else toast.info("Meal already added");
  };

  const handleRemoveMeal = (category, mealId) => {
    setSelectedMeals({
      ...selectedMeals,
      [category]: selectedMeals[category].filter((m) => m.meal !== mealId),
    });
  };

  const normalizeMeals = (meals) => {
    const categories = ["breakfast", "lunch", "dinner", "snacksAM", "snacksPM"];
    const normalized = {};
    categories.forEach((cat) => {
      if (!meals[cat]) {
        normalized[cat] = [];
      } else if (Array.isArray(meals[cat])) {
        normalized[cat] = meals[cat];
      } else {
        normalized[cat] = [meals[cat]];
      }
    });
    return normalized;
  };

  const handleSave = () => {
    const safeMeals = normalizeMeals(selectedMeals);
    onSave(week, day, safeMeals);
    onClose();
  };

  const openReplaceModal = (category, meal) => {
    setMealToReplace({ category, meal });
    setIsReplaceOpen(true);
  };
  const closeReplaceModal = () => {
    setIsReplaceOpen(false);
    setMealToReplace(null);
  };

  // === Render ===
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-gray-200 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#476171] text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  {week} - {day}
                </h2>
                <p className="text-blue-100 mt-1 flex items-center text-sm">
                  <IoInformationCircle className="mr-1" />
                  Add, replace or remove meals for this day
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <IoClose className="text-2xl cursor-pointer" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#476171]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                  {mealsCategories.map(({ key, label, icon }) => (
                    <div
                      key={key}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[300px] overflow-hidden"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-4 bg-[#f0f4f7] text-[#476171] rounded-t-lg">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{icon}</span>
                          <span className="font-semibold">{label}</span>
                        </div>
                        <span className="text-xs font-medium bg-white/80 px-2 py-1 rounded-full">
                          {selectedMeals[key]?.length || 0}/{limits[key] || 0}
                        </span>
                      </div>

                      {/* Add Meal Section */}
                      <div className="p-3 border-b">
                        <CustomSelect
                          options={meals
                            .filter((meal) => {
                              const mealType = meal?.type?.toLowerCase() || "";

                              if (key === "snacksAM" || key === "snacksPM") {
                                return mealType.startsWith("snack");
                              }

                              if (key === "lunch" || key === "dinner") {
                                return mealType === "lunch" || mealType === "dinner";
                              }

                              return mealType === key.toLowerCase();
                            })

                            .map((meal) => ({
                              value: meal._id,
                              label: meal.name + " / " + (meal.nameAr || ""),
                            }))}

                          disabled={templateId}
                          value={selectedCategory[key] || ""}
                          onChange={(value) => handleAddMeal(key, value)}
                          placeholder={`Select ${label}...`}
                          className="mb-2"
                        />
                      </div>

                      {/* Meal List */}
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {selectedMeals[key]?.length === 0 ? (
                          <div className="text-center text-gray-400 text-sm py-6">
                            No meals added yet
                          </div>
                        ) : (
                          selectedMeals[key]?.map((m) => (
                            <motion.div
                              key={m.meal}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <span className="text-gray-400 mr-2 text-lg">
                                  {icon}
                                </span>
                                <span className="truncate text-sm font-medium text-gray-700 flex-1">
                                  {m.name + (m.nameAr ? ` / ${m.nameAr}` : "")}
                                  {m.isDefault && (
                                    <span className="text-green-600 ml-1 text-xs">
                                      (Default)
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {templateId && (
                                  <button
                                    onClick={() => openReplaceModal(key, m)}
                                    className="p-1.5 text-gray-500 hover:text-[#476171] hover:bg-[#f0f4f7] rounded-md transition-colors"
                                  >
                                    <IoSwapVertical className="text-lg cursor-pointer" />
                                  </button>
                                )}
                                {!templateId &&
                                  <button
                                    onClick={() => handleRemoveMeal(key, m.meal)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    <IoClose className="text-lg cursor-pointer" />
                                  </button>
                                }
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 bg-white border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-5 py-2.5 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={` ${!templateId ? "bg-[#476171] cursor-pointer text-white px-5 py-2.5 rounded-lg hover:bg-[#3a5261] transition-colors font-medium" : "bg-gray-300 cursor-not-allowed text-gray-500 px-5 py-2.5 rounded-lg"} `}
                disabled={templateId}
              >
                Save Changes
              </button>
            </div>
          </motion.div>

          {/* Replace Meal Modal */}
          <AnimatePresence>
            {isReplaceOpen && mealToReplace && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]"
                onClick={closeReplaceModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white w-full max-w-md  rounded-xl shadow-xl p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold mb-4">Replace Meal</h3>

                  <CustomSelect
                    options={meals.map((meal) => ({
                      value: meal._id,
                      label: meal.name,
                    }))}
                    value={mealToReplace.meal.meal}
                    onChange={(value) => {
                      handleReplaceMeal(
                        mealToReplace.category,
                        mealToReplace.meal.meal,
                        value
                      );
                      closeReplaceModal();
                    }}
                    placeholder="Select replacement..."
                  />

                  <div className="flex justify-end mt-6 gap-3">
                    <button
                      onClick={closeReplaceModal}
                      className="px-4 py-2 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DayMealModal;
