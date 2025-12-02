import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loaderstart from "../../../ui/loading/Loaderstart";
import ReusableInput from "../../../ui/ReuseInput";
import NewButton from "../../../ui/NewButton";

const ProteinSource = () => {
  const [proteinName, setProteinName] = useState("");
  const [proteinNameAr, setProteinNameAr] = useState("");
  const [loading, setLoading] = useState(false);
  const [proteinId, setProteinId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const passedId = location?.state?.proteinId || null;

  const BaseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setProteinId(passedId);
  }, [passedId]);

  const isEditMode = Boolean(proteinId);

  // Create
  const handleSave = async () => {
    if (!proteinName.trim()) {
      toast.error("Protein source name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${BaseURL}/protein-sources`,
        { name: proteinName, nameAr: proteinNameAr, description: "Food", descriptionAr:"طعام" , category: "other", isVegan: false },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProteinName("");
      setProteinNameAr("");
      toast.success("Protein Source Created Successfully");
      navigate("/Admin/Settings/ProteinSources", { state: {} });
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error creating the protein source"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!proteinName.trim()) {
      toast.error("Protein source name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.patch(
        `${BaseURL}/protein-sources/${proteinId}`,
        { name: proteinName , nameAr: proteinNameAr },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProteinName("");
      setProteinNameAr("");
      toast.success("Protein Source Updated Successfully");
      navigate("/Admin/Settings/ProteinSources", { state: {} });
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error updating the protein source"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get protein source by id
  const getProtein = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BaseURL}/protein-sources/${proteinId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res?.data?.data?.proteinSource);
      setProteinName(res?.data?.data?.proteinSource?.name || "");
      setProteinNameAr(res?.data?.data?.proteinSource?.nameAr || "");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Error fetching the protein source"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      getProtein();
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
              navigate("/Admin/Settings/ProteinSources", { state: {} });
            }}
          />
          <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
            {isEditMode ? "Edit Protein Source" : "Add A New Protein Source"}
          </h2>
        </div>

        <hr className="border-gray-300 my-3" />

        {/* Input Section */}
        <div className="md:w-[50%] w-full mx-auto md:mx-0">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="w-full md:w-1/2">
              <ReusableInput
                label="Protein Source Name"
                value={proteinName}
                onChange={(e) => setProteinName(e.target.value)}
                placeholder="Enter protein source name"
              />
            </div>
            <div className="w-full md:w-1/2">
              <ReusableInput
                label="Protein Source Name (Arabic)"
                value={proteinNameAr}
                onChange={(e) => setProteinNameAr(e.target.value)}
                placeholder="Enter protein source name in Arabic"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 justify-start">
            <NewButton
              onClick={isEditMode ? handleUpdate : handleSave}
              className="bg-[#476171] hover:bg-[#3a515e] text-white px-6 py-2 rounded w-full md:w-auto"
            >
              {isEditMode ? "Update Protein Source" : "Create Protein Source"}
            </NewButton>
            <NewButton
              onClick={() => {
                navigate("/Admin/Settings/ProteinSources", { state: {} });
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

export default ProteinSource;
