import React, { useEffect, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import Loaderstart from "../../ui/loading/Loaderstart";
import { useLocation, useNavigate } from "react-router-dom";
import NewButton from "../../ui/NewButton";
import { toast } from "react-toastify";

const AddAllergens = ({ setactive }) => {
  const [allergenName, setAllergenName] = useState("");
  const [allergenNameAr, setAllergenNameAr] = useState("");
  const [loading, setLoading] = useState(false);
  const [allergenId, setAllergenId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const passedId = location?.state?.allergenId || null;

  const BaseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setAllergenId(passedId);
  }, [passedId]);

  const isEditMode = Boolean(allergenId);

  // Create
  const handleSave = async () => {
    if (!allergenName.trim()) {
      toast.error("Allergen name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${BaseURL}/allergensIngredients/allergens`,
        { name: allergenName, nameAr: allergenNameAr },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAllergenName("");
      setAllergenNameAr("");
      toast.success("Allergen Created Successfully");
      navigate("/Admin", { state: {} });
      setactive("Settings/Allergens");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error creating the allergen"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!allergenName.trim()) {
      toast.error("Allergen name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `${BaseURL}/allergensIngredients/allergens/${allergenId}`,
        { name: allergenName, nameAr: allergenNameAr },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAllergenName("");
      setAllergenNameAr("");
      toast.success("Allergen Updated Successfully");
      navigate("/Admin", { state: {} });
              setactive("Settings/Allergens");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error updating the allergen"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get allergen by id
  const getAllergen = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BaseURL}/allergensIngredients/allergen/${allergenId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAllergenName(res?.data?.data?.allergen?.name || "");
      setAllergenNameAr(res?.data?.data?.allergen?.nameAr || "");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error fetching the allergen"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      getAllergen();
    }
  }, [isEditMode]);

  return (
    <>
      {loading && <Loaderstart />}
      <div className="shadow-sm rounded-xl w-full bg-white overflow-auto h-[calc(100vh-77px)] p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <IoIosArrowBack
            className="cursor-pointer text-gray-400 text-xl"
            onClick={() => {
              navigate("/Admin", { state: {} });
              setactive("Settings/Allergens");
            }}
          />
          <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
            {isEditMode ? "Edit Allergen" : "Add A New Allergen"}
          </h2>
        </div>

        <hr className="border-gray-300 my-3" />

        {/* Input Section */}
        <div className="md:w-[85%] w-full mx-auto md:mx-0">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="w-full md:w-1/2">
              <ReusableInput
                label="Allergen Name"
                value={allergenName}
                onChange={(e) => setAllergenName(e.target.value)}
                placeholder="Enter allergen name"
              />
            </div>
            <div className="w-full md:w-1/2">
              <ReusableInput
                label="Allergen Name ( Ar )"
                value={allergenNameAr}
                onChange={(e) => setAllergenNameAr(e.target.value)}
                placeholder="Enter allergen Ar name"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 justify-start">
            <NewButton
              onClick={isEditMode ? handleUpdate : handleSave}
              className="bg-[#476171] hover:bg-[#3a515e] text-white px-6 py-2 rounded w-full md:w-auto"
            >
              {isEditMode ? "Update Allergen" : "Create Allergen"}
            </NewButton>
            <NewButton
              onClick={() => {
                navigate("/Admin", { state: {} });
                setactive("Settings/Allergens");
              }}
              className="bg-gray-200 hover:bg-gray-300 text-[#476171] px-6 py-2 rounded w-full md:w-auto"
            >
              Cancel
            </NewButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAllergens;
