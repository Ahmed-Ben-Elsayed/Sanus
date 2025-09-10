import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import ReusableInput from "../../ui/ReuseInput";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Loaderstart from "../../ui/loading/Loaderstart";
import { toast } from "react-toastify";
import NewButton from "../../ui/NewButton";

export const Freeze = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const orderId = location.state?.orderId;
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate()
  const getFreeze = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BaseUrl}/orders/getorderfreezedetails/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const freeze = res?.data?.data?.freezeDetails;
      if (freeze) {
        setDateFrom(freeze.startDate || "");
        setDateTo(freeze.endDate || "");
      }
    } catch (err) {
      console.error("Error fetching freeze details:", err);
      toast.error("Failed to load freeze details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) getFreeze(orderId);
  }, [orderId]);

  const handleSave = async () => {
    const today = new Date().toISOString().slice(0, 10); 

    if (!dateFrom || !dateTo) {
      toast.warning("Please fill in both dates");
      return;
    }

    if (dateFrom <= today) {
      toast.warning("Start date must be after today");
      return;
    }

    try {
      setSaving(true);
      await axios.patch(
        `${BaseUrl}/orders/${orderId}/status`,
        {
          status: "scheduled_freeze",
          startDate: dateFrom,
          endDate: dateTo,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Freeze saved successfully");
      navigate("/Admin/Tracking_Subscription", { state: {} });
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {loading && <Loaderstart />}
      <div className="w-full  h-full  md:min-h-[calc(100vh-77px)] p-6 bg-white rounded-lg shadow">
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2 text-[#7A83A3]">
            <IoIosArrowBack
              className="cursor-pointer"
              size={22}
              onClick={() => {  navigate("/Admin/Tracking_Subscription", { state: {} })  }}
            />
            Freeze
          </h2>
        </div>

        <hr className="h-[1px] border-none bg-[#E8E8E8]" />

        {/* Date Inputs */}
        <div className="flex flex-wrap gap-4 items-end mt-6">
          <div className="w-[180px]">
            <ReusableInput
              label="From Date"
              type="date"
              value={dateFrom ? new Date(dateFrom).toISOString().slice(0,10):""}
              onChange={(e) => setDateFrom(e.target.value)}
              custclassName="h-[42px]"
            />
          </div>

          <div className="w-[180px]">
            <ReusableInput
              label="To Date"
              type="date"
              value={dateTo ? new Date(dateTo).toISOString().slice(0,10) : "" }
              onChange={(e) => setDateTo(e.target.value)}
              custclassName="h-[42px]"
            />
          </div>

          <div className="w-full mt-4">
            <NewButton
              onClick={handleSave}
              disabled={saving}
              className={`bg-[#4a6375] text-white w-[180px] h-[42px] rounded hover:bg-[#3a5160] transition duration-200 text-base ${
                saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </NewButton>
          </div>
        </div>
      </div>
    </>
  );
};
