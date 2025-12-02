import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import LoadingOrder from "../../ui/loading/LoadingOrder";
import ReusableInput from "../../ui/ReuseInput";
import NewButton from "../../ui/NewButton";
import { useNavigate } from "react-router-dom";
export const ChangeBox = ({ loading }) => {
  const navigate = useNavigate()
  return (
    <div className="p-0 pb-5 font-sans shadow-2xl h-full md:min-h-[calc(100vh-77px)] overflow-y-auto bg-white rounded-xl overflow-x-hidden">
      {loading ? (
        <LoadingOrder />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4 px-4 pt-4">
            <h2 className="text-lg ms-5 md:text-xl font-semibold flex items-center gap-1 text-[#7A83A3]">
              <IoIosArrowBack
                className="cursor-pointer"
                onClick={() =>{   navigate("/Admin/Tracking_Subscription",{state:{}}) }}
              />
              Change Box
            </h2>
          </div>

          <hr className="bg-[#D1D1D1] border-none h-[1px] my-3 w-full mx-auto" />

          <div className="flex flex-col items-start gap-4 ms-10 mt-10 max-w-xs w-full">
            <ReusableInput
              label="Number Of Boxes"
              type="number"
              custclassName="h-[42px] w-full  pe-[10px!important]"
              placeholder="Boxes Number"
              max={24}
            />
            <NewButton
              className="bg-[#4a6375] text-white w-[24%] h-[42px] rounded hover:bg-[#3a5160] transition duration-200 text-base"
              // onClick={}
            >
              SAVE
            </NewButton>
          </div>
        </>
      )}
    </div>
  );
};
