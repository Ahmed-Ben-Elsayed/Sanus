import React, { useState, useEffect, useRef } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const ReusableSelector = ({
  label,
  name,
  value,
  onChange,
  options = [],
  className = "",
  custclassName = "",
  disabled=false,
  custclassNameArrow = "",
  onChangeAsObject = false,
  custclassNameItems = "",
  error = "",
  placeholder = "Select an option",
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = onChangeAsObject
    ? value
    : options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`flex flex-col gap-1 max-w-[150px] relative ${className}`}
    >
      {label && (
        <label className="text-sm font-semibold text-[#476171]">{label}</label>
      )}

      <div
        className={`relative cursor-pointer border rounded-lg px-3 py-[8.5px] text-[11px] text-[#E8E1DC] bg-[#476171] ${custclassName} ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        onClick={() => disabled === false ?   setOpen((prev) => !prev) : ""}
        style={{
          minHeight: "42px",
          height: "42px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="flex items-center text-[12px] justify-between w-full">
          {selectedOption ? (
            <div className="flex items-center gap-2">
              {selectedOption.icon && (
                <img src={selectedOption.icon} alt="" className="w-4 h-4" />
              )}
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span
              className="text-[#ccc] flex items-center"
              style={{ lineHeight: "1.8" }}
            >
              {placeholder}
            </span>
          )}

          <MdOutlineKeyboardArrowDown
            className={`text-xl text-[#E8E1DC] ${custclassNameArrow}`}
          />
        </div>

        {open && (
          <div
            className={`absolute top-full start-[-5px] md:w-[160px] w-full bg-white z-[9999] max-h-[300px] overflow-auto border mt-1 rounded-md  shadow-md ${custclassNameItems}`}
            style={{ position: "absolute", zIndex: 9999 }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeAsObject
                    ? onChange(option)
                    : onChange({ target: { name, value: option.value } });
                  setOpen(false);
                }}
                className="px-3 py-2 text-start hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-gray-800"
              >
                {option.icon && (
                  <img src={option.icon} alt="" className="w-4 h-4" />
                )}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default ReusableSelector;
