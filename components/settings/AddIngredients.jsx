import React, { useEffect, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import Loaderstart from "../../ui/loading/Loaderstart";
import { useLocation, useNavigate } from "react-router-dom";
import NewButton from "../../ui/NewButton";
import { toast } from "react-toastify";

const AddIngredients = ({ setactive }) => {
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientNameAr, setIngredientNameAr] = useState("");
  const [loading, setLoading] = useState(false);
  const [ingredientId, setIngredientId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const passedId = location?.state?.ingredientId || null;

  const BaseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setIngredientId(passedId);
  }, [passedId]);

  const isEditMode = Boolean(ingredientId);

  // Create
  const handleSave = async () => {
    if (!ingredientName.trim()) {
      toast.error("Ingredient name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${BaseURL}/allergensIngredients/ingredients`,
        { name: ingredientName, nameAr: ingredientNameAr },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIngredientName("");
      setIngredientNameAr("");
      toast.success("Ingredient Created Successfully");
      navigate("/Admin", { state: {} });
      setactive("Settings/Ingredients");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error creating the ingredient"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!ingredientName.trim()) {
      toast.error("Ingredient name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `${BaseURL}/allergensIngredients/ingredient/${ingredientId}`,
        { name: ingredientName, nameAr: ingredientNameAr },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIngredientName("");
      setIngredientNameAr("");
      toast.success("Ingredient Updated Successfully");
      navigate("/Admin", { state: {} });
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error updating the ingredient"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get ingredient by id
  const getIngredient = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BaseURL}/allergensIngredients/ingredients/${ingredientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIngredientName(res?.data?.data?.ingredient?.name || "");
      setIngredientNameAr(res?.data?.data?.ingredient?.nameAr || "");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error fetching the ingredient"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      getIngredient();
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
              setactive("Settings/Ingredients");
            }}
          />
          <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
            {isEditMode ? "Edit Ingredient" : "Add A New Ingredient"}
          </h2>
        </div>

        <hr className="border-gray-300 my-3" />

        {/* Input Section */}
        <div className="md:w-[85%] w-full mx-auto md:mx-0">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="w-full md:w-1/2">
              <ReusableInput
                label="Ingredient Name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                placeholder="Enter ingredient name"
              />
            </div>
            <div className="w-full md:w-1/2">
              <ReusableInput
                label="Ingredient Name ( Ar )"
                value={ingredientNameAr}
                onChange={(e) => setIngredientNameAr(e.target.value)}
                placeholder="Enter ingredient Ar name"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 justify-start">
            <NewButton
              onClick={isEditMode ? handleUpdate : handleSave}
              className="bg-[#476171] hover:bg-[#3a515e] text-white px-6 py-2 rounded w-full md:w-auto"
            >
              {isEditMode ? "Update Ingredient" : "Create Ingredient"}
            </NewButton>
            <NewButton
              onClick={() => {
                navigate("/Admin", { state: {} });
                setactive("Settings/Ingredients");
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

export default AddIngredients;
