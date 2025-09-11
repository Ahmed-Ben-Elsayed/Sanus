import React, { useEffect, useState } from 'react'
import ReusableInput from '../../ui/ReuseInput'
import { MdAdd } from 'react-icons/md'
import NewButton from '../../ui/NewButton';
import axios from 'axios';
import Loaderstart from '../../ui/loading/Loaderstart';
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaLess } from 'react-icons/fa';
import { IoIosCloseCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { TbDatabaseExclamation } from 'react-icons/tb';

export const Packge = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [packages, setPackages] = useState([]);
    const [packageId, setPackageId] = useState(null);
    const [Allpackages, setAllPackages] = useState([]);
    const [plane, setPlane] = useState([]);
    const [modal, setModal] = useState(false)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const BaseUrl = import.meta.env.VITE_API_BASE_URL;

    const getpkgs = async () => {
        try {
            setLoading(true);
            const packages = await axios.get(`${BaseUrl}/package`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (packages.status === 200) {
                console.log(packages.data.data.packages);
                setPackages(packages.data.data.packages);
                setAllPackages(packages.data.data.packages);
            }
        } catch (err) {
            console.error("Error fetching packages:", err);
        } finally {
            setLoading(false);
        }
    };

    const getPlanes = async () => {
        try {
            setLoading(true);
            const planes = await axios.get(`${BaseUrl}/plans`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (planes.status === 200) {
                console.log(planes.data.data.plans);
                setPlane(planes.data.data.plans);
            }
        } catch (err) {
            console.error("Error fetching plans:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getpkgs();
        // getPlanes();
    }, []);

    const filters = {
        planName: '',
        packageName: '',
        from: '',
        to: '',
    };
    const [filter, setFilter] = useState(filters);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e) => {
        console.log("Filter submitted:", filter);

        const filtered = Allpackages.filter((pkg) => {
            const isPackageNameMatch = filter.packageName
                ? pkg?.name?.toLowerCase().includes(filter.packageName.toLowerCase())
                : true;

            const isPlanNameMatch = filter.planName
                ? pkg?.plan?.name?.toLowerCase().includes(filter.planName.toLowerCase())
                : true;

            const isFromDateMatch = filter.from
                ? new Date(pkg.createdAt) >= new Date(filter.from)
                : true;

            const isToDateMatch = filter.to
                ? new Date(pkg.createdAt) <= new Date(filter.to)
                : true;

            return (
                isPackageNameMatch &&
                isPlanNameMatch &&
                isFromDateMatch &&
                isToDateMatch
            );
        });

        setPackages(filtered);
    };


    useEffect(() => {
        handleFilterSubmit();
    }, [filter]);
    // delete
    const deletePkg = async (id) => {
        try {
            setLoading(true)
            await axios.delete(`${BaseUrl}/package/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            toast.success('Packege Deleted Successfully')
            setPackageId("")
            setModal(false)

            const newPkgs = packages?.filter((p) => p._id !== id);
            setPackages(newPkgs);
        } catch (err) {
            setModal(false)
            console.log(err);
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            {loading && <Loaderstart />}
            <div className="shadow-sm rounded-xl w-full bg-white h-[calc(100vh-77px)] p-4 flex flex-col">
                {/* Filter Section */}
                <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
                    <div className="flex gap-4 flex-wrap md:flex-nowrap ">
                        <ReusableInput
                            name="packageName"
                            label="package Name"
                            placeholder="Enter P. Name"
                            className="min-w-[180px]"
                            onChange={handleFilterChange}
                            value={filter.packageName}
                        />
                        <ReusableInput
                            name="planName"
                            label="Plan Name"
                            placeholder="Enter Plan Name"
                            className="min-w-[180px]"
                            onChange={handleFilterChange}
                            value={filter.planName}
                        />
                        <ReusableInput
                            name="from"
                            label="Date From"
                            type="date"
                            className="min-w-[140px]"
                            onChange={handleFilterChange}
                            value={filter.from}
                        />
                        <ReusableInput
                            name="to"
                            label="To"
                            type="date"
                            onChange={handleFilterChange}
                            className="min-w-[140px]"
                            value={filter.to}
                        />
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                navigate('/Admin/Packages/Add', {
                                    state: {}
                                });
                            }} className="bg-[#476171] cursor-pointer text-white hover:bg-[#476171] flex items-center justify-center gap-2 py-[7px] px-5 rounded-lg w-full h-max"
                        >
                            Add New <MdAdd className="text-xl" />
                        </button>
                    </div>
                </div>

                <hr className="border-none block h-[1.5px] mb-5 bg-gray-200" />
                {/* Table */}
                {packages?.length > 0 ?
                    <div className="overflow-x-auto">
                        <table className="min-w-full h-full text-sm">
                            <thead>
                                <tr className="text-left bg-gray-100 text-[#7B809A]">
                                    <th className="p-3">Package Name</th>
                                    <th className="p-3">Plan Name</th>
                                    <th className="p-3">Templete Name</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Box</th>
                                    <th className="p-3">Carbs</th>
                                    <th className="p-3">include Breakfast</th>
                                    <th className="p-3">include Lunch</th>
                                    <th className="p-3">include Dinner</th>
                                    <th className="p-3">include Snack Am</th>
                                    <th className="p-3">include Snack Pm</th>
                                    <th className="p-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages?.map((pkg, index) => {
                                    const planObj = plane.find((p) => p.id === pkg?.plan?.id);
                                    const planName = planObj?.name || '-';
                                    return (
                                        <tr key={index} className="border-b border-b-gray-300 text-[#344767]">
                                            <td className="p-3">{pkg?.name}</td>
                                            <td className="p-3">{pkg?.plan?.name}</td>
                                            <td className="p-3">{pkg?.template?.name}</td>
                                            <td className="p-3">{new Date(pkg?.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 text-center">{pkg?.numberOfDays}</td>
                                            <td className="p-3 text-center">{pkg?.carbCount || "-"}</td>

                                            {/* ✅ Breakfast */}
                                            <td className="p-3 text-center">
                                                {pkg?.includeBreakfast ? (
                                                    <FaCheckCircle className="mx-auto text-green-400" />
                                                ) : (
                                                    <IoIosCloseCircle className="mx-auto text-red-400 text-[16px]" />
                                                )}
                                            </td>

                                            {/* ✅ Lunch */}
                                            <td className="p-3 text-center">
                                                {pkg?.includeLunch ? (
                                                    <FaCheckCircle className="mx-auto text-green-400" />
                                                ) : (
                                                    <IoIosCloseCircle className="mx-auto text-red-400 text-[16px]" />
                                                )}
                                            </td>

                                            {/* ✅ Dinner */}
                                            <td className="p-3 text-center">
                                                {pkg?.includeDinner ? (
                                                    <FaCheckCircle className="mx-auto text-green-400" />
                                                ) : (
                                                    <IoIosCloseCircle className="mx-auto text-red-400 text-[16px]" />
                                                )}
                                            </td>

                                            {/* ✅ Snacks AM */}
                                            <td className="p-3 text-center">
                                                {pkg?.includeSnacksAM ? (
                                                    <FaCheckCircle className="mx-auto text-green-400" />
                                                ) : (
                                                    <IoIosCloseCircle className="mx-auto text-red-400 text-[16px]" />
                                                )}
                                            </td>

                                            {/* ✅ Snacks PM */}
                                            <td className="p-3 text-center">
                                                {pkg?.includeSnacksPM ? (
                                                    <FaCheckCircle className="mx-auto text-green-400" />
                                                ) : (
                                                    <IoIosCloseCircle className="mx-auto text-red-400 text-[16px]" />
                                                )}
                                            </td>

                                            {/* ✅ Actions */}
                                            <td className="p-3 flex items-center justify-center gap-2">
                                                <img
                                                    onClick={() => {
                                                        navigate(`/Admin/Packages/Edit`, {
                                                            state: {
                                                                PkgId: pkg._id || pkg.id,
                                                            },
                                                        });
                                                    }}
                                                    alt=""
                                                    srcSet="/edit.png"
                                                    className="max-w-4 cursor-pointer"
                                                />
                                                <img
                                                    onClick={() => {
                                                        setModal(true), setPackageId(pkg?._id);
                                                    }}
                                                    alt=""
                                                    srcSet="/Delete.png"
                                                    className="max-w-5 cursor-pointer"
                                                />
                                            </td>
                                        </tr>

                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    :

                    <div className="h-[60vh] flex justify-center items-center text-[#476171] flex-col gap-3 text-lg sm:text-2xl text-center p-4">
                        <TbDatabaseExclamation className="text-4xl sm:text-5xl" />
                        <p>No Packages Found</p>
                        <p className="text-sm sm:text-base text-gray-500 mt-2">
                            Try adjusting your filters or create a new package
                        </p>
                    </div>
                }
                {modal ?
                    <Modal onClose={() => setModal(false)} onConfirm={() => deletePkg(packageId)} cancelText='No' open={modal} showActions children={"Are You Sure Delete This Package?"} />
                    : ""
                }
            </div>
        </>
    );
};
