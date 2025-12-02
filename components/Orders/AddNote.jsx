import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingOrder from "../../ui/loading/LoadingOrder";
import { toast } from "react-toastify";
import NewButton from "../../ui/NewButton";

export const AddNote = () => {
  const [note, setNote] = useState("");
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const orderIdNote = location?.state?.orderId;

  // ✅ fetch order note
  const getbyid = async (id) => {
    try {
      setLoadingFetch(true);
      const res = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNote(res?.data?.data?.order?.notes || "");
    } catch (err) {
      toast.error("Failed to load note");
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    if (orderIdNote) {
      getbyid(orderIdNote);
    }
  }, [orderIdNote]);

  // ✅ save note
  const handleSave = async () => {
    if (!note.trim()) {
      alert("Please enter a note before saving.");
      return;
    }

    try {
      setLoadingSave(true);
      await axios.patch(
        `${BASE_URL}/orders/${orderIdNote}/updateNote`,
        { notes: note },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Note saved successfully");
      setLoadingSave(false);
      navigate('/Admin/Restaurant_Orders',{state:{}});

    } catch (err) {
      console.log(err);
      toast.error("Failed to save note");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingFetch) return <LoadingOrder />;

  return (
    <div className="w-full h-full md:min-h-[calc(100vh-77px)] mx-auto p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg md:text-xl text-gray-400 font-semibold flex items-center gap-2">
          <IoIosArrowBack
            className="cursor-pointer"
            size={22}
            onClick={() => {   navigate('/Admin/Restaurant_Orders',{state:{}})} }
          />
          Add Note
        </h2>
      </div>

      <hr className="h-[1px] my-5 w-full border-none bg-[#E8E8E8]" />

      {/* Note TextArea */}
      <div className="mb-4">
        <label className="block text-[#7A83A3] font-medium mb-2">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
          className="w-full h-40 p-3 border border-[#91AEC0] text-[#476171] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#7A83A3]"
        />
      </div>

      {/* Save Button */}
      <NewButton
        onClick={handleSave}
        className="bg-[#4a6375] cursor-pointer text-white px-8 py-1 rounded-md hover:bg-[#3a5160] transition duration-200 disabled:opacity-50"
        disabled={loadingSave}
      >
        {loadingSave ? "Saving..." : "SAVE"}
      </NewButton>
    </div>
  );
};
