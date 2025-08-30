import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation } from "react-router-dom";
import Loading from "../../ui/loading/LoadingOrder"; // تأكد من وجود هذا المكون
import LoadingOrder from "../../ui/loading/LoadingOrder";
import { toast } from "react-toastify";
import NewButton from "../../ui/NewButton";

export const AddNote = ({ active, setactive }) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const orderIdNote = location.state.orderId;

  const getbyid = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNote(res?.data?.data?.order?.notes || "");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdNote) {
      getbyid(orderIdNote);
    }
  }, [orderIdNote]);

  const handleSave = async () => {
    if (note.trim()) {
      try {
        setLoading(true);
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
      } catch (err) {
        console.log(err);
        toast.error("Failed to save note");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a note before saving.");
    }
  };

  if (loading) return <LoadingOrder />;

  return (
    <div className="w-full min-h-[100%] mx-auto p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg md:text-xl text-gray-400 font-semibold flex items-center gap-2">
          <IoIosArrowBack
            className="cursor-pointer"
            size={22}
            onClick={() => setactive("Restaurant Orders")}
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
        disabled={loading}
      >
        {loading ? "Saving..." : "SAVE"}
      </NewButton>
    </div>
  );
};
