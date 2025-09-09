import React, { useEffect, useState } from 'react';
import { MdAdd } from "react-icons/md";
import ReusableInput from '../../ui/ReuseInput';
import ReusableSelector from '../../ui/ReusableSelector';
import axios from 'axios';
import Loaderstart from '../../ui/loading/Loaderstart';
import NewButton from '../../ui/NewButton';
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import { replace, useNavigate } from 'react-router-dom';

export const Plan = ({ setactive }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "bg-[#BAEB9E] text-gray-800";
            case "not-active":
                return "bg-[#DBDBDB] text-gray-800";
            default:
                return "";
        }
    };
    const [plans, setplans] = useState([])
    const [loading, setloading] = useState(false)
    const [Modalopen, setModalopen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const navigate = useNavigate()
    const [filters, setFilters] = useState({
        planname: "",
        from: "",
        to: "",
    });

    const BaseUrl = import.meta.env.VITE_API_BASE_URL
    const getplans = async () => {
        try {
            setloading(true)
            const plans = await axios.get(`${BaseUrl}/plans/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setplans(plans.data?.data?.plans)
            console.log(plans);
            
        } catch (err) {
            console.log(err);
        } finally {
            setloading(false)
        }
    }
    useEffect(() => {
        getplans()
    }, [])
    const deletePlane = async (id) => {
        try {
            setloading(true)
            // setloading(true);
            await axios.delete(`${BaseUrl}/plans/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setplans(plans.filter(plan => plan._id !== id));
            toast.success("Plan Deleted Successfully")
        } catch (err) {
            console.error("Error deleting plan:", err);
            toast.warning(err.response?.data?.message || "Failed to delete plan");
        } finally {
            setloading(false);
        }
    }

    const filteredPlans = plans?.filter((plan) => {
        const nameMatch = filters.planname
            ? plan.name.toLowerCase().includes(filters.planname.toLowerCase())
            : true;

        const dateFromMatch = filters.from
            ? new Date(plan.createdAt) >= new Date(filters.from)
            : true;

        const dateToMatch = filters.to
            ? new Date(plan.createdAt) <= new Date(filters.to)
            : true;

        return nameMatch && dateFromMatch && dateToMatch;
    });
    return (
        <>
            {loading && <Loaderstart />}
            <div className="shadow-sm rounded-xl w-full bg-white h-[calc(100vh-77px)] p-4 flex flex-col">
                {/* Filter Section */}
                <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
                    <div className="w-full flex flex-col lg:flex-row justify-between  gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-3">
                            <ReusableInput
                                name="planname"
                                label="Plan Name"
                                placeholder="Enter P. Name"
                                value={filters.planname}
                                onChange={(e) =>
                                    setFilters({ ...filters, planname: e.target.value })
                                }
                                className="h-[42px] w-full text-xs"
                                custclassName="h-[42px]"
                            />

                            <ReusableInput
                                name="from"
                                label="Date From"
                                type="date"
                                value={filters.from}
                                onChange={(e) =>
                                    setFilters({ ...filters, from: e.target.value })
                                }
                                className="h-[42px] w-full text-xs"
                                custclassName="h-[42px]"
                            />

                            <ReusableInput
                                name="to"
                                label="To"
                                type="date"
                                value={filters.to}
                                onChange={(e) =>
                                    setFilters({ ...filters, to: e.target.value })
                                }
                                className="h-[42px] w-full text-xs"
                                custclassName="h-[42px]"
                            />
                        </div>
                        <div className="flex items-end mt-[13px]">
                            <NewButton
                                onClick={() => {
                                    setactive("Add New Plan"),
                                    navigate('/Admin', { state: {} })
                                }}
                                children={"Add New "} icon={MdAdd}
                                className='mt-4'
                            >
                            </NewButton>

                        </div>
                    </div>
                </div>

                <hr className="border-none block h-[1.5px] mb-5 bg-gray-200" />

                {/* Table */}
                <div className="overflow-x-auto h-100">
                    <table className="min-w-full  text-sm">
                        <thead>
                            <tr className="text-left bg-gray-100 text-[#7B809A]">
                                <th className="p-3">Plan Name</th>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlans?.length > 0 ? (
                                filteredPlans.map((plan, index) => (
                                    <tr key={index} className="border-b border-b-gray-300 text-[#344767]">
                                        <td className="p-3">{plan?.name}</td>
                                        <td className="p-3">{plan?.createdAt ? new Date(plan?.createdAt).toLocaleDateString() : ""}</td>
                                        {/* <td className="p-3">
                                            <ReusableSelector
                                                options={[
                                                    { label: "Active", value: "active" },
                                                    { label: "Not Active", value: "not-active" },
                                                ]}
                                                value="active"
                                                className="min-w-[120px]"
                                                custclassNameArrow='text-[#344767!important]'
                                                custclassNameItems='w-[100%!important] start-[0px]'
                                                custclassName={` ${getStatusClass("active")} rounded-md text-xs w-[90%]  min-h-[2px!important] h-[30px!important] flex items-center `}

                                            />
                                        </td> */}
                                        <td className="p-3 flex gap-2 justify-end">
                                            <img
                                                src="/edit.png"
                                                alt="Edit"
                                                className="w-4 object-contain cursor-pointer"
                                                onClick={() => {
                                                    setactive('Add New Plan');
                                                        navigate('/Admin', {
                                                            state: { planid: plan?._id }
                                                        });
                                                }}
                                            />
                                            <img
                                                onClick={() => {
                                                    setSelectedPlanId(plan._id);
                                                    setModalopen(true);
                                                }}
                                                src="/Delete.png"
                                                alt="Delete"
                                                className="w-5 cursor-pointer"
                                            />
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-4 text-gray-500">
                                        No plans found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                open={Modalopen}
                onClose={() => setModalopen(false)}
                showActions={true}
                title='Delete Plan'

                confirmText='Delete'
                onConfirm={() => {
                    deletePlane(selectedPlanId);
                    setModalopen(false);
                }}
            >
                <div>Are you sure you want to delete this plan?</div>
            </Modal>
        </>
    );
};
