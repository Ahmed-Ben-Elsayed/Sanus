import React, { useEffect, useState, useRef } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { IoIosArrowBack } from "react-icons/io";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loaderstart from "../../ui/loading/Loaderstart";

const InfoSection = ({ title, fields }) => (
  <div className="flex flex-col gap-2 md:w-[30%] w-full">
    <p className="text-[#828282] mb-3 font-medium">{title}</p>
    {fields.map(({ label, value }, idx) =>
      value ? (
        <ReusableInput
          key={idx}
          readOnly
          label={label}
          value={value}
          className="w-full rounded-3xl"
        />
      ) : null
    )}
  </div>
);

const NutritionSection = ({ 
  title, 
  customer, 
  userNutrition, 
  setUserNutrition, 
  updateData, 
  custId,
  formatAllergies 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [localNutrition, setLocalNutrition] = useState({
    calories: "",
    protein: { grams: "" },
    carbs: { grams: "" },
    fat: { grams: "" },
    water: ""
  });
  const originalValuesRef = useRef({});

  // تحديث localNutrition عندما يتغير userNutrition من الأب
  useEffect(() => {
    if (userNutrition && Object.keys(userNutrition).length > 0) {
      setLocalNutrition(userNutrition);
      originalValuesRef.current = JSON.parse(JSON.stringify(userNutrition));
    }
  }, [userNutrition]);

  // تحديث localNutrition عندما يتغير customer مباشرة
  useEffect(() => {
    if (customer?.nutritionNeeds) {
      const initialData = {
        calories: customer.nutritionNeeds.calories || "",
        protein: {
          grams: customer.nutritionNeeds.protein?.grams || "",
        },
        carbs: {
          grams: customer.nutritionNeeds.carbs?.grams || "",
        },
        fat: {
          grams: customer.nutritionNeeds.fat?.grams || "",
        },
        water: customer.nutritionNeeds.water || "",
      };
      setLocalNutrition(initialData);
      originalValuesRef.current = JSON.parse(JSON.stringify(initialData));
    }
  }, [customer]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    // تحقق من أن القيمة رقمية إذا كان الحقل رقماً
    if (['calories', 'water', 'protein.grams', 'carbs.grams', 'fat.grams'].includes(field)) {
      if (value === '') {
        value = '';
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
          value = numValue.toString();
        } else {
          return; // لا تقبل قيم غير رقمية
        }
      }
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLocalNutrition(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setLocalNutrition(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    // تمرير البيانات المعدلة إلى المكون الأب
    setUserNutrition(localNutrition);
    updateData(custId, localNutrition);
    setEditMode(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalNutrition(originalValuesRef.current);
    setEditMode(false);
  };

  const nutritionFields = [
    { label: "Daily Calories", key: "calories", unit: "kcal", type: "number" },
    { label: "Protein", key: "protein.grams", unit: "g", type: "number" },
    { label: "Carbs", key: "carbs.grams", unit: "g", type: "number" },
    { label: "Fat", key: "fat.grams", unit: "g", type: "number" },
    { label: "Water", key: "water", unit: "ml", type: "number" },
  ];

  const preferencesFields = [
    {
      label: "Activity Level",
      value: customer?.activityLevel || "N/A",
    },
    {
      label: "Allergies",
      value: formatAllergies(customer?.allergies),
    },
    {
      label: "Dislikes",
      value: formatAllergies(customer?.dislikes),
    },
  ];

  // Get value from nested object
  const getNestedValue = (obj, key) => {
    if (!key.includes('.')) return obj?.[key] || "";
    const keys = key.split('.');
    return keys.reduce((acc, k) => acc?.[k], obj) || "";
  };

  return (
    <div className="flex flex-col gap-2 md:w-[30%] w-full">
      <div className="flex relative justify-between items-center mb-3">
        <p className="text-[#828282] font-medium">{title}</p>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex gap-1 bg-gray-400 px-4 py-2 rounded-lg hover:bg-gray-600 items-center top-[-50px] start-[0px] cursor-pointer text-white absolute transition"
          >
            <FaEdit /> Edit
          </button>
        ) : (
          <div className="flex absolute top-[-50px] start-0 gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#476171] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#476171]/80 transition"
            >
              <FaSave /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 cursor-pointer bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Nutrition Section - Editable */}
      <div className="mb-6">
        {nutritionFields.map(({ label, key, unit, type }) => {
          const value = getNestedValue(localNutrition, key);

          if (editMode) {
            return (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-1 outline-none"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    min="0"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">
                    {unit}
                  </span>
                </div>
              </div>
            );
          } else {
            return (
              <ReusableInput
                key={key}
                readOnly
                label={label}
                value={value ? `${value} ${unit}` : "Not set"}
                className="w-full rounded-3xl mb-3"
              />
            );
          }
        })}
      </div>

      {/* Preferences Section - Read Only */}
      <div className="border-t pt-4">
        <p className="text-[#666] font-medium mb-3">Preferences</p>
        {preferencesFields.map(({ label, value }, idx) => (
          <ReusableInput
            key={idx}
            readOnly
            label={label}
            value={value}
            className="w-full rounded-3xl mb-3"
          />
        ))}
      </div>
    </div>
  );
};

export const CustomerInfo = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const custId = location.state?.custId;
  
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(true);
  const [userNutrition, setUserNutrition] = useState({
    calories: "",
    protein: {
      grams: "",
    },
    carbs: {
      grams: "",
    },
    fat: {
      grams: "",
    },
    water: "",
  });

  // Redirect if no custId
  useEffect(() => {
    if (!custId) {
      navigate("/Admin/Account_Customers");
      return;
    }
    getdata(custId);
  }, [custId, navigate]);

  const updateData = async (id, nutritionData) => {
    try {
      setLoading(true);
      const dataToUpdate = nutritionData || userNutrition;
      
      const payload = {
        nutritionNeeds: {
          calories: Number(dataToUpdate.calories) || 0,
          protein: {
            grams: Number(dataToUpdate.protein?.grams) || 0,
          },
          carbs: {
            grams: Number(dataToUpdate.carbs?.grams) || 0,
          },
          fat: {
            grams: Number(dataToUpdate.fat?.grams) || 0,
          },
          water: Number(dataToUpdate.water) || 0,
        },
      };
      
      const response = await axios.put(
        `${BASE_URL}/auth/update-user-nutrition/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      console.log("Update successful:", response.data);
      await getdata(id);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update nutrition data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getdata = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/auth/getUserInfoById/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.Data) {
        setCustomer(response.data.Data);
        
        // Initialize nutrition data from API response
        if (response.data.Data?.nutritionNeeds) {
          const nutrition = response.data.Data.nutritionNeeds;
          const nutritionData = {
            calories: nutrition.calories || "",
            protein: {
              grams: nutrition.protein?.grams || "",
            },
            carbs: {
              grams: nutrition.carbs?.grams || "",
            },
            fat: {
              grams: nutrition.fat?.grams || "",
            },
            water: nutrition.water || "",
          };
          setUserNutrition(nutritionData);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load customer data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format allergies and dislikes for display
  const formatAllergies = (allergies) => {
    if (!allergies || !Array.isArray(allergies) || allergies.length === 0) {
      return "None";
    }
    
    return allergies
      .map((a) => {
        if (!a) return "";
        const arabicPart = a.nameAr ? `${a.nameAr} / ` : "";
        const englishPart = a.name || "";
        return arabicPart + englishPart;
      })
      .filter(Boolean)
      .join(", ");
  };

  // Format addresses for display
  const formatAddress = (address) => {
    if (!address) return "No address";
    
    const parts = [
      address.address,
      address.zone,
      address.building && `Building ${address.building}`,
      address.floor && `Floor ${address.floor}`,
      address.city,
      address.country
    ].filter(Boolean);
    
    return parts.join(", ");
  };

  // Get default address
  const getDefaultAddress = () => {
    if (!customer?.addresses || !Array.isArray(customer.addresses)) {
      return null;
    }
    return (
      customer.addresses.find((addr) => addr.isDefault) ||
      customer.addresses?.[0]
    );
  };

  // Get work address
  const getWorkAddress = () => {
    if (!customer?.addresses || !Array.isArray(customer.addresses)) {
      return null;
    }
    return customer.addresses.find((addr) => addr.label === "Work");
  };

  if (!custId) {
    return null;
  }

  return (
    <>
      {loading && <Loaderstart />}
      {!loading && (
        <div className="shadow-sm bg-white rounded-xl w-full h-[calc(100vh-77px)] p-4 overflow-y-auto">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1 text-[#7A83A3]">
            <IoIosArrowBack
              className="cursor-pointer"
              onClick={() => {
                navigate("/Admin/Account_Customers", { state: {} });
              }}
            />
            Customer Info
          </h2>

          <div className="customer-info border-[#9F9F9F] border w-[96%] rounded-2xl mt-[50px] mx-auto p-4 relative">
            {/* === Profile Picture === */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center">
              <img
                src={
                  customer?.profileImage
                    ? customer.profileImage.replace(
                        "http://137.184.244.200:5050",
                        "/img-proxy"
                      )
                    : "/fileLogo.png"
                }
                alt={customer?.name || "Customer"}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 bg-white"
                onError={(e) => {
                  e.target.src = "/fileLogo.png";
                }}
              />
            </div>
            
            {/* === Info Sections === */}
            <div className="w-full flex flex-col md:flex-row gap-6 justify-between mt-20 p-3">
              {/* Personal Info */}
              <InfoSection
                title="Personal Info"
                fields={[
                  { label: "Name", value: customer?.name },
                  { label: "Email", value: customer?.email },
                  { label: "Age", value: customer?.age?.toString() },
                  { label: "Gender", value: customer?.gender },
                  { label: "Goal", value: customer?.goal },
                  {
                    label: "Height",
                    value: customer?.height ? `${customer.height} cm` : "",
                  },
                  {
                    label: "Weight",
                    value: customer?.weight ? `${customer.weight} kg` : "",
                  },
                ]}
              />

              {/* Divider (Desktop only) */}
              <span className="hidden md:block w-[1.5px] bg-[#D7D7D7]"></span>

              {/* Nutrition & Preferences Info - Editable */}
              <NutritionSection
                title="Nutrition & Preferences"
                customer={customer}
                userNutrition={userNutrition}
                setUserNutrition={setUserNutrition}
                updateData={updateData}
                custId={custId}
                formatAllergies={formatAllergies}
              />

              {/* Divider (Desktop only) */}
              <span className="hidden md:block w-[1.5px] bg-[#D7D7D7]"></span>

              {/* Address & Subscription Info */}
              <InfoSection
                title="Address & Subscription"
                fields={[
                  {
                    label: "Default Address",
                    value: getDefaultAddress()
                      ? formatAddress(getDefaultAddress())
                      : "No address",
                  },
                  {
                    label: "Work Address",
                    value: getWorkAddress()
                      ? formatAddress(getWorkAddress())
                      : "No work address",
                  },
                  {
                    label: "Member Since",
                    value: customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : "",
                  },
                ]}
              />

              {/* Divider (Desktop only) */}
              <span className="hidden md:block w-[1.5px] bg-[#D7D7D7]"></span>

              {/* All Addresses */}
              <InfoSection
                title="All Addresses"
                fields={
                  customer.addresses?.length > 0
                    ? customer.addresses.map((addr, idx) => ({
                        label: addr.label || `Address ${idx + 1}`,
                        value: formatAddress(addr),
                      }))
                    : [{ label: "Addresses", value: "No addresses available" }]
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
