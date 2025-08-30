import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../ui/loading/LoadingOrder';
import { toast } from 'react-toastify';
import { IoIosArrowBack } from 'react-icons/io';
import { useLocation } from 'react-router-dom';

export const AddtimeSlot = ({ onCreated, active, setactive }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const TimeslotId = location?.state?.TimeslotId || null;

  const isEditMode = Boolean(TimeslotId);

  // تحويل من "8am-11am" إلى {from: "08:00", to: "11:00"}
  const parseTimeSlot = (slot) => {
    const [from, to] = slot.split("-");

    const convertTo24 = (timeStr) => {
      const match = timeStr.match(/^(\d+)(am|pm)$/);
      if (!match) return "";

      let hour = parseInt(match[1], 10);
      const period = match[2];

      if (period === "pm" && hour !== 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;

      return `${String(hour).padStart(2, "0")}:00`;
    };

    return {
      from: convertTo24(from),
      to: convertTo24(to),
    };
  };

  const formatTime12Hour = (time24) => {
    const [hourStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12 || 12;
    return `${hour}${ampm}`;
  };

  const getTimeslotById = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/time-slots/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const slot = res?.data?.data?.time_slot;
      console.log(slot);
      
      const { from, to } = parseTimeSlot(slot);
      setFromTime(from);
      setToTime(to);
    } catch (err) {
      toast.error("Failed to load time slot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      getTimeslotById(TimeslotId);
    }
  }, [TimeslotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromTime || !toTime) {
      toast.error("Please fill in both time fields");
      return;
    }

    const formattedSlot = `${formatTime12Hour(fromTime)}-${formatTime12Hour(toTime)}`;

    try {
      setLoading(true);

      if (isEditMode) {
        await axios.put(
          `${BASE_URL}/time-slots/${TimeslotId}`,
          { time_slot: formattedSlot },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Time slot updated successfully");
      } else {
        await axios.post(
          `${BASE_URL}/time-slots`,
          { time_slot: formattedSlot },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Time slot created successfully");
      }

      setFromTime("");
      setToTime("");
      setactive("Timeslot");

      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[100%] p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg my-[20px] mt-[-10px] md:text-xl font-semibold flex items-center gap-1 text-[#7A83A3]">
        <IoIosArrowBack
          className="cursor-pointer"
          onClick={() => setactive("Timeslot")}
        />
        {isEditMode ? "Edit Time Slot" : "Add Time Slot"}
      </h2>

      <hr className="border-none block h-[1.5px] mt-[-10px] mb-5 bg-gray-200" />

      <form onSubmit={handleSubmit} className="space-y-5 w-[20%]">
        <div>
          <label className="block text-sm font-medium text-[#344767] mb-1">
            From
          </label>
          <input
            type="time"
            className="w-full text-[#476171] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344767] mb-1">
            To
          </label>
          <input
            type="time"
            className="w-full text-[#476171] px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#476171] cursor-pointer hover:bg-[#476171d1] text-white px-6 py-2 rounded shadow"
        >
          {loading ? <Loading /> : isEditMode ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};
