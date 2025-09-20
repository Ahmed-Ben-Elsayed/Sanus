import React, { useEffect, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { IoIosArrowBack } from "react-icons/io";
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

export const CustomerInfo = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const custId = location.state.custId;
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      setCustomer(response.data.Data);
      console.log(response.data.Data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (custId) {
      getdata(custId);
    }
  }, [custId]);

  // Format allergies and dislikes for display
  const formatAllergies = (allergies) => {
    return allergies?.map((a) => a.nameAr + " / " + a.name).join(", ") || "None";
  };

  // Format addresses for display
  const formatAddress = (address) => {
    return `${address.address}, ${address.zone}, Building ${address.building}, Floor ${address.floor}, ${address.city}, ${address.country}`;
  };

  // Get default address
  const getDefaultAddress = () => {
    return customer.addresses?.find((addr) => addr.isDefault) || customer.addresses?.[0];
  };

  // Get work address
  const getWorkAddress = () => {
    return customer.addresses?.find((addr) => addr.label === "Work");
  };

  return (
    <>
      {loading && <Loaderstart />}
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
              src={customer?.profileImage?.replace("http://137.184.244.200:5050", "/img-proxy")}
              alt={customer.name}
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
                { label: "Age", value: customer?.age },
                { label: "Gender", value: customer?.gender },
                { label: "Goal", value: customer?.goal },
                { label: "Height", value: customer?.height ? `${customer.height} cm` : "" },
                { label: "Weight", value: customer?.weight ? `${customer.weight} kg` : "" },
              ]}
            />

            {/* Divider (Desktop only) */}
            <span className="hidden md:block w-[1.5px] bg-[#D7D7D7]"></span>

            {/* Nutrition & Preferences Info */}
            <InfoSection
              title="Nutrition & Preferences"
              fields={[
                {
                  label: "Daily Calories",
                  value: customer.nutritionNeeds?.calories
                    ? `${customer.nutritionNeeds.calories} kcal`
                    : "",
                },
                {
                  label: "Protein",
                  value: customer.nutritionNeeds?.protein
                    ? `${customer.nutritionNeeds.protein.grams}g (${customer.nutritionNeeds.protein.percentage}%)`
                    : "",
                },
                {
                  label: "Carbs",
                  value: customer.nutritionNeeds?.carbs
                    ? `${customer.nutritionNeeds.carbs.grams}g (${customer.nutritionNeeds.carbs.percentage}%)`
                    : "",
                },
                {
                  label: "Fat",
                  value: customer.nutritionNeeds?.fat
                    ? `${customer.nutritionNeeds.fat.grams}g (${customer.nutritionNeeds.fat.percentage}%)`
                    : "",
                },
                {
                  label: "Water",
                  value: customer.nutritionNeeds?.water
                    ? `${customer.nutritionNeeds.water} ml`
                    : "",
                },
                {
                  label: "Activity Level",
                  value: customer?.activityLevel,
                },
                {
                  label: "Allergies",
                  value: formatAllergies(customer?.allergies),
                },
                {
                  label: "Dislikes",
                  value: formatAllergies(customer?.dislikes),
                },
              ]}
            />

            {/* Divider (Desktop only) */}
            <span className="hidden md:block w-[1.5px] bg-[#D7D7D7]"></span>

            {/* Address & Subscription Info */}
            <InfoSection
              title="Address & Subscription"
              fields={[
                {
                  label: "Default Address",
                  value: getDefaultAddress() ? formatAddress(getDefaultAddress()) : "No address",
                },
                {
                  label: "Work Address",
                  value: getWorkAddress() ? formatAddress(getWorkAddress()) : "No work address",
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
    </>
  );
};
