import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPlus, FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loaderstart from "../../ui/loading/Loaderstart";
import NewButton from "../../ui/NewButton";
import Modal from "../../ui/Modal";

export const OnBoardingComponent = ({ active, setactive }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setmodal] = useState(false)
  const token = localStorage.getItem("token");
  const [pageId, SetPageId] = useState("")

  const getData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/onboarding`);
      const steps = response?.data?.data?.steps || [];
      const formattedPages = steps.map((step) => ({
        id: step.id || step._id,
        title: step.pageTitle,
        date: new Date(step.createdAt).toLocaleDateString("en-GB"),
        stepNumber: step.stepNumber,
      }));
      setPages(formattedPages);
      localStorage.setItem(
        "numberOfPages",
        JSON.stringify(formattedPages.length)
      );
    console.log(response);
    
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const DeletePage = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/onboarding/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setmodal(false)
      if (response.status === 200) {
        toast.success("Page deleted successfully");
        getData();

      }
    } catch (err) {
      console.error("Error deleting page:", err);
    }
  };

  return (
    <>
      <div className="bg-white p-4 md:p-6 h-full md:h-[100%] rounded-xl shadow-sm overflow-x-auto">
        <div className="w-full flex justify-end items-center mb-2">
          <button
            title={
              pages.length >= 3
                ? "You can only create up to 3 pages"
                : "Create a new page"
            }
            disabled={pages.length >= 3}
            onClick={() => navigate(`/Admin/Create`)}
            className={`${pages.length >= 3
                ? "cursor-not-allowed bg-gray-400"
                : "bg-[#476171] cursor-pointer hover:bg-[#476171ee]"
              } text-[#E8E1DC] me-[-8px] mt-4    flex items-center gap-2 py-2 px-4 rounded-lg`}
          >
            Create Page <FaPlus className="text-md" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto hidden md:table">
            <thead>
              <tr className="text-left text-[#7B809A] text-sm border-b border-[#E8E8E8]">
                <th className="py-3 px-2">Title Pages</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2 flex me-2 justify-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    <Loaderstart />
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-400">
                    No onboarding pages found.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-[#e8e3e3] text-[#344767] text-sm"
                  >
                    <td className="py-4 px-2 font-semibold">{page.title}</td>
                    <td className="py-4 px-2">{page.date}</td>
                    <td className="py-4 px-2 me-[0px] flex justify-end items-center gap-0">
                      <NewButton
                        onClick={() => {
                          setactive("Edit Boarding");
                          navigate(`/Admin/${page.stepNumber}`);
                        }}
                        className="!bg-transparent !text-[#44818E] !shadow-none !px-2 !py-1 hover:underline"
                        icon={null}
                      >
                        <img alt="" srcSet="/edit.png" className="w-4" />
                      </NewButton>
                      <NewButton
                        onClick={() => {
                          setmodal(true),
                            SetPageId(page?.id || page?._id)
                        }}
                        className="!bg-transparent !text-red-500 !shadow-none !px-2 !py-1 hover:underline"
                        icon={null}
                      >
                        <img alt="" srcSet="/Delete.png" className="w-5" />
                      </NewButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <Loaderstart />
          ) : pages.length === 0 ? (
            <p className="text-center text-gray-400">
              No onboarding steps found.
            </p>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-[#344767] font-semibold">
                  {page.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">{page.date}</div>
                <div className="flex justify-start items-center">
                  <NewButton
                    onClick={() => {
                      setactive("Edit Boarding");
                      navigate(`/Admin/${page.stepNumber}`);
                    }}
                    className="!bg-transparent !text-[#44818E] !shadow-none !px-2 !py-1 mt-3 hover:underline"
                    icon={FaRegEdit}
                  >
                  </NewButton>
                  <NewButton
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this page?"
                        )
                      ) {
                        DeletePage(page.id);
                      }
                    }}
                    className="!bg-transparent !text-red-500 !shadow-none !px-2 !py-1 mt-3 hover:underline"
                    icon={null}
                  >
                    <img alt="" srcSet="/Delete.png" className="w-5" />
                  </NewButton>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Modal open={modal} onConfirm={() => DeletePage(pageId)} cancelText="Cancel" showActions confirmText="Delete" children="Are You Sure Delete This Page" onClose={() => setmodal(false)} />
    </>
  );
};
