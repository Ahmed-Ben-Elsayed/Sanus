import React, { useEffect, useMemo, useState } from "react";
import { MdAdd } from "react-icons/md";
import NewButton from "../../ui/NewButton";
import ReusableInput from "../../ui/ReuseInput";
import axios from "axios";
import Loaderstart from "../../ui/loading/Loaderstart";
import Modal from "../../ui/Modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { TbDatabaseExclamation } from "react-icons/tb";

const Meals = ({ active, setactive }) => {
  const BaseURL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [allMeals, setAllMeals] = useState([]); 
  const [meals, setMeals] = useState([]);       
  const [loading, setloading] = useState(true);
  const [mealId, setMealID] = useState();
  const [model, setmodel] = useState(false);

  const [filters, setFilters] = useState({
    mealname: "",
    from: "",
    to: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const limit = 10; 

  const getAllMeals = async () => {
    try {
      setloading(true);
      const token = localStorage.getItem("token") || "";
      const { data } = await axios.get(`${BaseURL}/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiMeals = data?.data?.meals ?? data?.meals ?? [];
      setAllMeals(apiMeals);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch meals");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    getAllMeals();
  }, []);


  useEffect(() => {
    let filtered = [...allMeals];

    if (filters.mealname) {
      filtered = filtered.filter((meal) =>
        meal.name.toLowerCase().includes(filters.mealname.toLowerCase())
      );
    }

    if (filters.from) {
      filtered = filtered.filter((meal) => new Date(meal.date) >= new Date(filters.from));
    }
    if (filters.to) {
      filtered = filtered.filter((meal) => new Date(meal.date) <= new Date(filters.to));
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.min(pagination.currentPage, totalPages) || 1;
    const start = (currentPage - 1) * limit;
    const paginatedMeals = filtered.slice(start, start + limit);

    setMeals(paginatedMeals);
    setPagination({ currentPage, totalPages, totalItems });
  }, [allMeals, filters, pagination.currentPage]);

  // ===============================
  // Delete Meal
  // ===============================
  const DeleteMeal = async (id) => {
    try {
      setloading(true);
      const token = localStorage.getItem("token") || "";
      await axios.delete(`${BaseURL}/meals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Meal Deleted Successfully");
      setAllMeals(allMeals.filter((m) => m._id !== id));
      setmodel(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete meal");
    } finally {
      setloading(false);
    }
  };

  const handleReset = () => {
    setFilters({ mealname: "", from: "", to: "" });
  };

  const goToPage = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  };

  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const windowSize = 2;
    const pages = [];

    if (total <= windowSize) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (current <= 3) {
      start = 1;
      end = Math.min(total, windowSize);
    } else if (current >= total - 2) {
      start = Math.max(1, total - (windowSize - 1));
      end = total;
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [pagination.totalPages, pagination.currentPage]);

  // ===============================
  // Render
  // ===============================
  return (
    <>
      {loading ? <Loaderstart /> :
        <div className="shadow-sm rounded-xl w-full bg-white h-[calc(100vh-77px)] p-3 sm:p-4 flex flex-col">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
            <div className="w-full flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-4">
                <ReusableInput
                  name="mealname"
                  label="Meal Name"
                  placeholder="Enter M. Name"
                  value={filters.mealname}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, mealname: e.target.value }))
                  }
                  className="h-[42px] w-full text-xs sm:text-sm"
                  custclassName="h-[42px]"
                />

                <ReusableInput
                  name="from"
                  label="Date From"
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="h-[42px] w-full text-xs sm:text-sm"
                  custclassName="h-[42px]"
                />

                <ReusableInput
                  name="to"
                  label="To"
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="h-[42px] w-full text-xs sm:text-sm"
                  custclassName="h-[42px]"
                />
              </div>
              <div className="flex items-end mt-2 sm:mt-[28px] gap-2">
                <NewButton
                  onClick={() => {
                    navigate("/Admin/Meals/Add", { state: {} });
                  }}
                  children={"Add New"}
                  icon={MdAdd}
                  className="!py-2 w-full sm:w-auto"
                />
              </div>
            </div>
          </div>
          <hr className="border-none block h-[1.5px] mb-5 bg-gray-200" />

          {/* Table */}
          {meals?.length > 0 ? (
            <>
              <div className="overflow-x-auto flex-1">
                <div className="min-w-[600px] sm:min-w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-100 text-[#7B809A]">
                        <th className="p-2 sm:p-3">Image</th>
                        <th className="p-2 sm:p-3">Meal Name</th>
                        <th className="p-2 sm:p-3 hidden sm:table-cell">Meal Type</th>
                        <th className="p-2 sm:p-3 hidden md:table-cell">Taste Type</th>
                        <th className="p-2 sm:p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {meals.map((plan, index) => (
                        <tr key={plan?._id || index} className="border-b border-b-gray-300 text-[#344767]">
                          <td className="p-2 sm:p-3">
                            <img
                              className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded"
                              alt={plan?.name}
                              src={plan?.imageUrl.replace("http://137.184.244.200:5050", "/img-proxy")}
                            />
                          </td>
                          <td className="p-2 sm:p-3">{plan?.name || "-"}</td>
                          <td className="p-2 sm:p-3 hidden sm:table-cell">{plan?.type || "-"}</td>
                          <td className="p-2 sm:p-3 hidden md:table-cell">{plan?.temperatureType || "-"}</td>
                          <td className="p-2 sm:p-3 flex gap-2 justify-end">
                            <button
                              onClick={() => navigate("/Admin/Meals/Edit", { state: { mealId: plan?._id } })}
                              className="p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                              aria-label="Edit"
                            >
                              <img src="/edit.png" alt="Edit" className="w-3 h-4 sm:w-4 sm:h-5 object-contain" />
                            </button>
                            <button
                              onClick={() => { setMealID(plan._id); setmodel(true); }}
                              className="p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                              aria-label="Delete"
                            >
                              <img src="/Delete.png" alt="Delete" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  {pagination.totalItems ? (
                    <span className="ml-1 sm:ml-2">• {pagination.totalItems} total</span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                  <button onClick={() => goToPage(1)} disabled={pagination.currentPage === 1} className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md cursor-pointer border text-xs sm:text-sm ${pagination.currentPage === 1 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-[#476171] border-gray-300 hover:bg-gray-50"}`} title="First">First</button>
                  <button onClick={() => goToPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className={`px-2 py-1 sm:px-3 sm:py-1 cursor-pointer rounded-md border flex items-center gap-1 text-xs sm:text-sm ${pagination.currentPage === 1 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-[#476171] border-gray-300 hover:bg-gray-50"}`} title="Previous">
                    <IoIosArrowBack className="hidden sm:block" />
                    <span className="sm:ml-1">Prev</span>
                  </button>

                  {pagination.currentPage > 3 && pagination.totalPages > 5 && (
                    <span className="px-1 sm:px-2 text-xs sm:text-sm">…</span>
                  )}

                  {pageNumbers.map((num) => (
                    <button key={num} onClick={() => goToPage(num)} className={`px-2 py-1 sm:px-3 sm:py-1 cursor-pointer rounded-md border text-xs sm:text-sm ${pagination.currentPage === num ? "bg-[#476171] text-white border-[#476171]" : "text-[#476171] border-gray-300 hover:bg-gray-50"}`}>
                      {num}
                    </button>
                  ))}

                  {pagination.currentPage < pagination.totalPages - 2 && pagination.totalPages > 5 && (
                    <span className="px-1 sm:px-2 text-xs sm:text-sm">…</span>
                  )}

                  <button onClick={() => goToPage(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className={`px-2 py-1 sm:px-3 sm:py-1 cursor-pointer rounded-md border flex items-center gap-1 text-xs sm:text-sm ${pagination.currentPage === pagination.totalPages ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-[#476171] border-gray-300 hover:bg-gray-50"}`} title="Next">
                    <span className="sm:mr-1">Next</span>
                    <IoIosArrowForward className="hidden sm:block" />
                  </button>

                  <button onClick={() => goToPage(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md border text-xs sm:text-sm ${pagination.currentPage === pagination.totalPages ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-[#476171] border-gray-300 hover:bg-gray-50"}`} title="Last">Last</button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[60vh] flex justify-center items-center text-[#476171] flex-col gap-3 text-lg sm:text-2xl text-center p-4">
              <TbDatabaseExclamation className="text-4xl sm:text-5xl" />
              <p>No Meals Found</p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Try adjusting your filters or create a new Meal
              </p>
            </div>
          )}

          {/* Delete Modal */}
          <Modal
            onClose={() => setmodel(false)}
            onConfirm={() => DeleteMeal(mealId)}
            open={model}
            showActions
            confirmText="Delete"
            cancelText="Cancel"
          >
            Are You Sure Delete This Meal?
          </Modal>
        </div>
      }
    </>
  );
};

export default Meals;
