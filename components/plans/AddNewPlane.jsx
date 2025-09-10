import React, { useEffect, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import Loaderstart from "../../ui/loading/Loaderstart";
import { useLocation, useNavigate } from "react-router-dom";
import NewButton from "../../ui/NewButton";
import { toast } from "react-toastify";

export const AddNewPlan = () => {
    const [planName, setPlanName] = useState("");
    const [loading, setloading] = useState(false);
    const [planeId , SetplaneId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const planid = location?.state?.planid || null;

    const BaseURL = import.meta.env.VITE_API_BASE_URL;
    useEffect(()=>{
        SetplaneId(planid)
    },[planid])
    const isEditMode = Boolean(planeId);
    const handleSave = async () => {
        if (!planName.trim()) {
            toast.error("Plan name is required");
            return;
        }

        try {
            setloading(true);
            await axios.post(`${BaseURL}/plans`, {
                name: planName,
                description: "plan"
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPlanName("");
            toast.success("Plan Created Successfully");
            navigate('/Admin/Plans',{state:{}})
        } catch (err) {
            console.log(err);
            toast.error("Error creating the plan");
        } finally {
            setloading(false);
        }
    };

    const handleUpdate = async () => {
        if (!planName.trim()) {
            toast.error("Plan name is required");
            return;
        }

        try {
            setloading(true);
            await axios.patch(`${BaseURL}/plans/${planeId}`, {
                name: planName,
                description: "plan"
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPlanName("");
            toast.success("Plan Updated Successfully");
            navigate('/Admin/Plans',{state:{}})
        } catch (err) {
            console.log(err);
            toast.error("Error updating the plan");
        } finally {
            setloading(false);
        }
    };

    const getPlan = async () => {
        try {
            setloading(true);
            const res = await axios.get(`${BaseURL}/plans/${planeId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPlanName(res?.data?.data?.plan?.name || "");
        } catch (err) {
            console.log(err);
            toast.error("Error fetching the plan");
        } finally {
            setloading(false);
        }
    };

    useEffect(() => {
        if (isEditMode) {
            getPlan();
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
                        onClick={() => { navigate('/Admin/Plans',{state:{}}) }}
                    />
                    <h2 className="text-lg md:text-xl font-semibold text-[#7A83A3]">
                        {isEditMode ? "Edit Plan" : "Add A New Plan"}
                    </h2>
                </div>

                <hr className="border-gray-300 my-3" />

                {/* Input Section */}
                <div className="md:w-[30%] w-[90%] mx-auto md:mx-0">
                    <ReusableInput
                        label="Plan Name"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="Enter plan name"
                    />

                    {/* Buttons */}
                    <div className="mt-auto pt-4 flex flex-col md:flex-row gap-2 justify-start">
                        <NewButton
                            onClick={isEditMode ? handleUpdate : handleSave}
                            className="bg-[#476171] hover:bg-[#3a515e] text-white px-6 py-2 rounded w-full md:w-auto"
                        >
                            {isEditMode ? "Update Plan" : "Create Plan"}
                        </NewButton>
                        <NewButton
                            onClick={() => { navigate('/Admin/Plans',{state:{}}) }}
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
