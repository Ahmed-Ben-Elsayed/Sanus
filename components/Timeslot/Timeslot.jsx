import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../../ui/loading/LoadingOrder';
import Modal from '../../ui/Modal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import NewButton from '../../ui/NewButton';
import { TbDatabaseExclamation } from 'react-icons/tb';

export const Timeslot = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [timeSlots, setTimeSlots] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()
  const itemsPerPage = 12;
  const [isactive, setIsActive] = useState()
  const getAllTimes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/time-slots`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTimeSlots(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTimes();
  }, []);

  const totalPages = Math.ceil(timeSlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedSlots = timeSlots.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const deactive = async (id , isActive) => {
    try {
      setLoading(true);
      await axios.patch(`${BASE_URL}/time-slots/${id}/deactivate`, {
        is_active: isActive
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await getAllTimes();
      toast.success(`Status is changed successfully `);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full p-6  h-full md:min-h-[calc(100vh-77px)] bg-white rounded-lg shadow relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#7A83A3]">Timeslots</h2>
            <NewButton
              onClick={() => {     navigate(`/Admin/Timeslot/Add`)}}
              className="bg-[#476171] cursor-pointer hover:bg-[#476171d8] transition px-4 py-2 text-white rounded shadow text-sm"
            >
              Add Time Slot
            </NewButton>
          </div>
          <hr className="border-none block h-[1.5px]  my-3 bg-gray-200" />
          {/* Table */}
          {selectedSlots.length > 0 ?
            <div className="overflow-x-auto rounded-lg border  border-gray-200">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">From</th>
                    <th className="px-6 py-3">To</th>
                    <th className="px-6  py-3">Status</th>
                    <th className="px-6 flex justify-end py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSlots.map((slot, index) => {
                    // if (!slot.is_active) return null;

                    const [from, to] = slot.time_slot.split("-");

                    return (
                      <tr key={slot._id} className="border-b border-b-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">{startIndex + index + 1}</td>
                        <td className="px-6 py-4">{from}</td>
                        <td className="px-6 py-4">{to}</td>

                        <td className="px-5 text-center py-4">
                          <p
                            onClick={
                              slot?.is_active
                                ? () => {
                                  setSelectedId(slot._id);
                                  setModal(true);
                                  setIsActive(false)
                                }
                                : () => {
                                  setSelectedId(slot._id);
                                  setModal(true);
                                  setIsActive(true)
                                }
                            }
                            className={`${slot?.is_active ? "bg-[#BAEB9E] cursor-pointer" : "cursor-pointer bg-[#DBDBDB]"
                              } max-w-[40%] py-1 px-2 rounded-md`}
                          >
                            {slot?.is_active ? "Active" : "Deactive"}
                          </p>
                        </td>

                        <td className="px-6 flex gap-2 justify-end py-4">
                          <img
                            onClick={() => {
                              navigate(`/Admin/Timeslot/Edit`, {
                                state: {
                                  TimeslotId: slot?._id,
                                },
                              });
                            }}
                            alt="Edit"
                            src="/edit.png"
                            className="w-4 me-3 object-contain cursor-pointer"
                          />

                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
            : <div className="flex flex-col items-center justify-center h-[60vh] py-12">
              <TbDatabaseExclamation className="text-5xl text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">No Timeslots Found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or create a new timeslot</p>
            </div>}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 absolute bottom-0 bg-white py-3">
              <nav className="flex items-center space-x-2 text-sm">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1 text-xl rounded bg-white text-gray-600 hover:bg-gray-100"
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 cursor-pointer rounded ${currentPage === i + 1
                      ? "bg-[#E5E5E8] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={handleNext}
                  className="px-3 py-1 text-xl rounded bg-white text-gray-600 hover:bg-gray-100"
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </nav>
            </div>
          )}
        </div >
      )}

      {/* Confirmation Modal */}
      <Modal
        open={modal}
        showActions={true}
        onConfirm={() => {
          deactive(selectedId , isactive);
          setModal(false);
        }}
        onClose={() => setModal(false)}
      >
        Are you sure you want to {!isactive ? "deactivate" : "activate"} this time slot?
      </Modal>
    </>
  );
};
