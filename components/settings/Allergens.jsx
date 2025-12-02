import React, { useEffect, useState } from 'react';
import { MdAdd } from "react-icons/md";
import ReusableInput from '../../ui/ReuseInput';
import ReusableSelector from '../../ui/ReusableSelector';
import axios from 'axios';
import Loaderstart from '../../ui/loading/Loaderstart';
import NewButton from '../../ui/NewButton';
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { TbDatabaseExclamation } from 'react-icons/tb';
import { IoIosArrowBack } from 'react-icons/io';

const Allergens = () => {
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

    const [allergens, setAllergens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAllergenId, setSelectedAllergenId] = useState(null);
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        allergenName: "",
        from: "",
        to: "",
    });

    const BaseUrl = import.meta.env.VITE_API_BASE_URL;

    const getAllergens = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BaseUrl}/allergensIngredients/allergens/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAllergens(res.data?.data?.allergens || []);
            console.log(res);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllergens();
    }, []);

    const deleteAllergen = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${BaseUrl}/allergensIngredients/allergens/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAllergens(allergens.filter((allergen) => allergen._id !== id));
            toast.success("Allergen Deleted Successfully");
        } catch (err) {
            console.error("Error deleting Allergen:", err);
            toast.warning(err.response?.data?.message || "Failed to delete Allergen");
        } finally {
            setLoading(false);
        }
    };

    const filteredAllergens = allergens.filter((allergen) => {
        const nameMatch = filters.allergenName
            ? allergen.name.toLowerCase().includes(filters.allergenName.toLowerCase())
            : true;

        const dateFromMatch = filters.from
            ? new Date(allergen.createdAt) >= new Date(filters.from)
            : true;

        const dateToMatch = filters.to
            ? new Date(allergen.createdAt) <= new Date(filters.to)
            : true;

        return nameMatch && dateFromMatch && dateToMatch;
    });

    return (
        <>
            {loading && <Loaderstart />}
            <div className="shadow-sm rounded-xl w-full bg-white h-[calc(100vh-77px)] p-4 flex flex-col">
                <div className="flex items-center gap-1 mb-2 ms-[-5px]">
                                <IoIosArrowBack
                                    className="cursor-pointer text-gray-400 text-md"
                                    onClick={() => {
                                        navigate('/Admin/Settings', {
                                            state: {}
                                        });
                                    }}
                                />
                                <h2 className="text-sm md:text-md font-semibold text-[#7A83A3]">
                                    Settings / Allergens
                                </h2>
                            </div>
                {/* Filter Section */}
                <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
                    <div className="w-full flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-3">
                            <ReusableInput
                                name="allergenName"
                                label="Allergen Name"
                                placeholder="Enter Allergen Name"
                                value={filters.allergenName}
                                onChange={(e) =>
                                    setFilters({ ...filters, allergenName: e.target.value })
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
                                    navigate('/Admin/Settings/Allergens/Add', { state: {} })

                                }}
                                children={"Add New Allergen"} icon={MdAdd}
                                className='mt-4'
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-none block h-[1.5px] mb-5 bg-gray-200" />

                {/* Table */}
                {filteredAllergens.length > 0 ? (
                    <div className="overflow-x-auto h-100">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left bg-gray-100 text-[#7B809A]">
                                    <th className="p-3">Allergen Name</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {

                                    filteredAllergens.map((allergen, index) => (
                                        <tr key={index} className="border-b border-b-gray-300 text-[#344767]">
                                            <td className="p-3">{allergen?.name + " / " + allergen?.nameAr} </td>
                                            <td className="p-3">
                                                {allergen?.createdAt
                                                    ? new Date(allergen?.createdAt).toLocaleDateString()
                                                    : ""}
                                            </td>
                                            <td className="p-3 flex gap-2 justify-end">
                                                <img
                                                    src="/edit.png"
                                                    alt="Edit"
                                                    className="w-4 object-contain cursor-pointer"
                                                    onClick={() => {
                                                        navigate('/Admin/Settings/Allergens/Edit', {
                                                            state: { allergenId: allergen?._id }
                                                        });
                                                    }}
                                                />
                                                <img
                                                    onClick={() => {
                                                        setSelectedAllergenId(allergen._id);
                                                        setModalOpen(true);
                                                    }}
                                                    src="/Delete.png"
                                                    alt="Delete"
                                                    className="w-5 cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="h-[60vh] flex justify-center items-center text-[#476171] flex-col gap-3 text-lg sm:text-2xl text-center p-4">
                        <TbDatabaseExclamation className="text-4xl sm:text-5xl" />
                        <p>No Allergens Found</p>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            Try adjusting your filters or create a new allergen
                        </p>
                    </div>
                )}
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                showActions={true}
                title='Delete Allergen'
                confirmText='Delete'
                onConfirm={() => {
                    deleteAllergen(selectedAllergenId);
                    setModalOpen(false);
                }}
            >
                <div>Are you sure you want to delete this allergen?</div>
            </Modal>
        </>
    );
}

export default Allergens;
