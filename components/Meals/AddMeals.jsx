import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import ReusableInput from "../../ui/ReuseInput";
import ReusableSelector from "../../ui/ReusableSelector";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import InputTags from "../../ui/InputTags";
import Loaderstart from "../../ui/loading/Loaderstart";

const AddMeals = () => {
  const location = useLocation();
  const mealId = location.state?.mealId;
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");

  const [loadingCount, setLoadingCount] = useState(0);

  const [meal, setMeal] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    type: "",
    calories: "",
    temperatureType: "",
    imageUrl: null,
    nutritionalValues: {
      protein: "",
      fat: "",
      carbs: "",
      Portion: "",
    },
  });

  const [allIngredients, setAllIngredients] = useState([]);
  const [allAllergens, setAllAllergens] = useState([]);
  const [proteinSources, setProteinSources] = useState([]);
  const [selectedproteinSources, setselectedProteinSources] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState([]);

  const BaseURL = import.meta.env.VITE_API_BASE_URL;

  const startLoading = () => setLoadingCount((p) => p + 1);
  const stopLoading = () => setLoadingCount((p) => Math.max(p - 1, 0));

  // API Calls
  const getProteinSources = async () => {
    try {
      startLoading();
      const res = await axios.get(`${BaseURL}/protein-sources`);
      setProteinSources(res?.data?.data?.proteinSources || []);
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const getAllergens = async () => {
    try {
      startLoading();
      const res = await axios.get(`${BaseURL}/allergensIngredients/allergens`);
      setAllAllergens(res?.data?.data?.allergens || []);
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const getIngredients = async () => {
    try {
      startLoading();
      const res = await axios.get(
        `${BaseURL}/allergensIngredients/ingredients`
      );
      setAllIngredients(res?.data?.data?.ingredients || []);
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const getMealById = async () => {
    try {
      startLoading();
      const res = await axios.get(`${BaseURL}/meals/${mealId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const m = res.data.data.meal;
      setMeal({
        name: m.name || "",
        nameAr: m.nameAr || "",
        descriptionAr: m.descriptionAr || "",
        description: m.description || "",
        type: m.type || "",
        calories: m.calories?.toString() || "",
        temperatureType: m.temperatureType || "",
        imageUrl: m?.imageUrl || null,
        nutritionalValues: {
          protein: m.nutritionalValues?.protein?.toString() || "",
          fat: m.nutritionalValues?.fat?.toString() || "",
          carbs: m.nutritionalValues?.carbs?.toString() || "",
          Portion: m.nutritionalValues?.Portion?.toString() || "",
        },
      });

      setSelectedIngredients(m.ingredients?.map((i) => i._id) || []);
      setSelectedAllergens(m.allergens?.map((a) => a._id) || []);
      setselectedProteinSources(m.proteinSource?.map((p) => p._id) || []);
    } catch (err) {
      console.log("Error fetching meal:", err);
      toast.error("Failed to load meal data");
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    getProteinSources();
    getAllergens();
    getIngredients();
    if (mealId) getMealById();
  }, [mealId]);

  // Handlers (unchanged)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["protein", "fat", "carbs", "Portion"].includes(name)) {
      setMeal((prev) => ({
        ...prev,
        nutritionalValues: { ...prev.nutritionalValues, [name]: value },
      }));
    } else {
      setMeal((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMeal((prev) => ({ ...prev, imageUrl: file }));
  };

  // Validation (unchanged)
  const validateForm = () => {
    if (!meal.name.trim()) return "Meal name is required";
    if (!meal.nameAr.trim()) return "Meal name in Arabic is required";
    if (!meal.calories.trim() || isNaN(meal.calories))
      return "Calories must be a number";
    if (!meal.description.trim()) return "Description is required";
    if (!meal.descriptionAr.trim()) return "Description in Arabic is required";
    if (!meal.type.trim()) return "Meal type is required";
    if (!meal.temperatureType.trim()) return "Temperature type is required";
    if (!mealId && !meal.imageUrl) return "Image is required";
    return null;
  };

  // Submit
  const saveMeal = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.warn(errorMsg);
      return;
    }

    try {
      startLoading();
      const data = new FormData();
      data.append("name", meal.name);
      data.append("nameAr", meal.nameAr);
      data.append("description", meal.description);
      data.append("descriptionAr", meal.descriptionAr);
      data.append("type", meal.type);
      data.append("calories", meal.calories);
      data.append("temperatureType", meal.temperatureType);
      if (meal.imageUrl) data.append("imageUrl", meal.imageUrl);
      data.append("nutritionalValues", JSON.stringify(meal.nutritionalValues));

      selectedIngredients.forEach((i) => data.append("ingredients[]", i));
      selectedAllergens.forEach((a) => data.append("allergens[]", a));
      selectedproteinSources.forEach((p) => data.append("proteinSource[]", p));

      let res;
      if (mealId) {
        res = await axios.patch(`${BaseURL}/meals/${mealId}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("Meal updated successfully 🎉");
      } else {
        res = await axios.post(`${BaseURL}/meals`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("Meal added successfully 🎉");
      }
      navigate("/Admin/Meals", { state: {} });
    } catch (err) {
      console.error("Error saving meal:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="shadow-sm rounded-xl overflow-auto w-full h-full md:h-[calc(100vh-77px)]  bg-white p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <IoIosArrowBack
          className="cursor-pointer text-gray-400 text-xl"
          onClick={() => {
            navigate("/Admin/Meals", {
              state: {},
            });
          }}
        />
        <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
          {mealId ? "Update Meal" : "Add New Meal"}
        </h2>
      </div>

      {loadingCount > 0 && <Loaderstart />}

      <hr className="border-none block h-[1.5px] mb-5 bg-gray-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Info */}
        <div className="md:col-span-2 lg:col-span-1">
          <ReusableInput
            label="Meal Name"
            placeholder="Enter meal name"
            name="name"
            value={meal?.name}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <ReusableInput
            label="Meal Name (Arabic)"
            placeholder="Enter meal name in Arabic"
            name="nameAr"
            value={meal?.nameAr}
            onChange={handleChange}
          />
        </div>

        <div>
          <ReusableInput
            label="Calories"
            type="number"
            placeholder="Enter calories"
            name="calories"
            value={meal?.calories}
            onChange={handleChange}
            custclassName="!pe-3"
          />
        </div>

        {/* Meal Type */}
        <div>
          <ReusableSelector
            label="Meal Type"
            name="type"
            value={meal.type}
            placeholder="Select meal type"
            options={[
              { label: "Breakfast", value: "breakfast" },
              { label: "Lunch", value: "lunch" },
              { label: "Dinner", value: "dinner" },
              { label: "Snack", value: "snack" },
            ]}
            className="!min-w-full mt-[4px]"
            custclassName="bg-white !text-[#476171]"
            custclassNameArrow="!text-[#476171]"
            onChange={(val) =>
              setMeal((prev) => ({
                ...prev,
                type: val?.target?.value ?? val,
              }))
            }
          />
        </div>

        {/* Temperature */}
        <div>
          <ReusableSelector
            label="Temperature Type"
            name="temperatureType"
            placeholder="Select temperature type"
            value={meal.temperatureType}
            options={[
              { label: "Hot", value: "hot" },
              { label: "Cold", value: "cold" },
            ]}
            className="min-w-full mt-[4px]"
            custclassName="bg-white !text-[#476171]"
            custclassNameArrow="!text-[#476171]"
            custclassNameItems="!min-w-full ms-1"
            onChange={(val) =>
              setMeal((prev) => ({
                ...prev,
                temperatureType: val?.target?.value ?? val,
              }))
            }
          />
        </div>

        {/* Nutritional Values */}
        <div>
          <ReusableInput
            label="Protein"
            type="number"
            custclassName="!pe-3"
            placeholder="Enter protein"
            name="protein"
            value={meal?.nutritionalValues?.protein}
            onChange={handleChange}
          />
        </div>

        <div>
          <ReusableInput
            label="Fat"
            type="number"
            custclassName="!pe-3"
            placeholder="Enter fat"
            name="fat"
            value={meal?.nutritionalValues?.fat}
            onChange={handleChange}
          />
        </div>

        <div>
          <ReusableInput
            label="Carbs"
            custclassName="!pe-3"
            placeholder="Enter carbs"
            name="carbs"
            type="number"
            value={meal?.nutritionalValues?.carbs}
            onChange={handleChange}
          />
        </div>

        <div>
          <ReusableSelector
            label={"Portion"}
            placeholder="Enter portion"
            name={"portion"}
            value={meal?.nutritionalValues?.Portion}
            options={[
              { label: "P1", value: "P1" },
              { label: "P2", value: "P2" },
              { label: "P3", value: "P3" },
              { label: "P4", value: "P4" },
            ]}
            className="min-w-full mt-[4px]"
            custclassName="bg-white !text-[#476171]"
            custclassNameItems="!min-w-full ms-1"
            custclassNameArrow="!text-[#476171]"
            onChange={(e) =>
              setMeal({
                ...meal,
                nutritionalValues: {
                  ...meal?.nutritionalValues,
                  Portion: e.target.value,
                },
              })
            }
          />
        </div>

        {/* Ingredients */}
        <div className="md:col-span-2 lg:col-span-1 mt-[4px]">
          <InputTags
            label="Ingredients"
            placeholder="Select ingredients"
            value={selectedIngredients}
            onChange={setSelectedIngredients}
            options={allIngredients.map((i) => ({
              label: ` ${i?.name} / ${i?.nameAr || ""}`,
              value: i?._id,
            }))}
          />
        </div>

        {/* Allergens */}
        <div className="md:col-span-2 lg:col-span-1 mt-1">
          <InputTags
            label="Allergens"
            placeholder="Select allergens"
            value={selectedAllergens}
            onChange={setSelectedAllergens}
            options={allAllergens.map((a) => ({
              label: ` ${a?.name} / ${a?.nameAr || ""}`,
              value: a?._id,
            }))}
          />
        </div>

        {/* Protein Source */}
        <div className="md:col-span-2 lg:col-span-1 mt-[4px]">
          <InputTags
            label="Protein Source"
            placeholder="Select Protein Source"
            value={selectedproteinSources}
            onChange={setselectedProteinSources}
            options={proteinSources.map((i) => ({
              label: i?.name+ " / " +(i?.nameAr||""),
              value: i?._id,
            }))}
          />
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[#476171] font-bold my-2">
              Description
            </label>

            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="text-xs bg-gray-200 px-3 py-1 rounded"
            >
              {lang === "en" ? "AR" : "EN"}
            </button>
          </div>
          <textarea
            name={lang === "en" ? "description" : "descriptionAr"}
            rows={3}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder={
              lang === "en" ? "Write description..." : "اكتب الوصف..."
            }
            value={lang === "en" ? meal?.description : meal?.descriptionAr}
            onChange={handleChange}
          />
        </div>

        {/* Photo Upload */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <h1 className="text-[#476171] font-semibold mb-2">Photo</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:flex-1">
              <input
                type="file"
                id="photoUpload"
                name="imageUrl"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="photoUpload"
                className="absolute top-0 end-0 cursor-pointer border-[#91AEC0] h-full flex items-center px-4 py-1 text-sm text-[#344767] font-semibold border rounded-e-md"
              >
                Browse
              </label>
              <input
                type="text"
                readOnly
                value={meal?.imageUrl ? meal?.imageUrl?.name : ""}
                placeholder="Upload meal image"
                className="w-full border cursor-auto border-[#91AEC0] rounded-md px-3 py-2 focus:outline-none pr-20"
              />
            </div>
            {meal.imageUrl && (
              <div className="sm:w-auto w-full flex justify-center sm:block">
                <img
                  src={
                    meal.imageUrl instanceof File
                      ? URL.createObjectURL(meal.imageUrl)
                      : meal.imageUrl.replace(
                          "http://137.184.244.200:5050",
                          "/img-proxy"
                        )
                  }
                  alt="Preview"
                  className="w-20 h-14 object-cover rounded"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-start">
        <button
          onClick={saveMeal}
          className="bg-[#476171] w-full sm:w-auto cursor-pointer text-white font-semibold py-2 px-6 rounded-md hover:bg-[#344767] transition"
        >
          {mealId ? "Update Meal" : "Save Meal"}
        </button>
      </div>
    </div>
  );
};

export default AddMeals;
