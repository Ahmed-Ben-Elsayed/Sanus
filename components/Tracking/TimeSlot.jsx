import React, { useEffect, useState } from "react";
import ReusableInput from "../../ui/ReuseInput";
import { IoIosArrowBack } from "react-icons/io";
import ReusableSelector from "../../ui/ReusableSelector";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Loading from "../../ui/loading/LoadingOrder";
import { toast } from "react-toastify";
import NewButton from "../../ui/NewButton";

export const TimeSlot = ({ active, setactive }) => {
  const location = useLocation();
  const timeslotId = location?.state?.orderId;

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [selectedTime, setSelectedTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState("");

  const getTimeslot = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const timeValue = res?.data?.data?.order?.time_slot?.value;
      const timeId = res?.data?.data?.order?.time_slot?.id;

      if (timeValue && timeId) {
        setSelectedTime({ label: timeValue, value: timeId });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getAllTimes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/time-slots`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const timesArr = res?.data?.data
        ?.filter((item) => item.is_active === true)
        ?.map((item) => ({
          label: item.time_slot,
          value: item._id,
        }));

      setTimes(timesArr);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTime || !timeslotId) return;

    try {
      setLoading(true);
      await axios.patch(
        `${BASE_URL}/orders/${timeslotId}/details`,
        {
          time_slot_value: selectedTime?.label,
          time_slot_id: selectedTime?.value,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Time slot updated successfully");
    } catch (err) {
      toast.error(err?.data?.response?.message);
      console.log(err );
    
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeslotId) getTimeslot(timeslotId);
  }, [timeslotId]);

  useEffect(() => {
    getAllTimes();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full min-h-[100%] p-4 md:p-6 bg-white rounded-lg shadow">
          {/* Header */}
          <div className="mb-3">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2 text-[#7A83A3]">
              <IoIosArrowBack
                className="cursor-pointer"
                size={22}
                onClick={() => setactive("Tracking Subscription")}
              />
              Time Slot
            </h2>
          </div>
          <hr className="h-[1px] border-none bg-[#E8E8E8]" />

          {/* Content */}
          <div className="w-full flex flex-col md:flex-row md:items-center gap-4 mt-4">
            {/* Selector */}
            <div className="w-full md:w-1/2 lg:w-1/3">
              <ReusableSelector
                value={selectedTime}
                options={times}
                onChange={(val) => setSelectedTime(val)}
                label="Time Slot (select to Update)"
                className="!min-w-full text-[#3A5160!important]"
                custclassNameArrow="text-[#3A5160!important]"
                custclassName="bg-[white!important] text-[#3A5160!important]"
                onChangeAsObject={true}
              />
            </div>

            {/* Button */}
            <div className="w-full mt-5 md:w-auto">
              <NewButton
                onClick={handleSave}
                className="w-full md:w-auto bg-[#4a6375] cursor-pointer mt-1 text-white px-5 py-2 rounded hover:bg-[#3a5160] transition duration-200"
                children={"Save"}
              />
            </div>
          </div>

          {/* Example: Create new time slot (responsive) */}
          {/* 
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 my-4 w-full md:w-2/3">
            <ReusableInput
              label="New Time Slot"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
              placeholder="e.g. 8am-11am"
              name="time_slot"
              className="w-full md:flex-1"
            />
            <button
              onClick={handleCreate}
              className="w-full md:w-auto bg-[#4a6375] mt-2 md:mt-6 text-white px-5 py-2 rounded hover:bg-[#3a5160] transition duration-200"
            >
              Create
            </button>
          </div> 
          */}
        </div>
      )}
    </>
  );
};
