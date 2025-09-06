import React, { useState, useRef, useEffect } from "react";
import { IoChevronDown, IoClose } from "react-icons/io5";

const InputTags = ({
  value = [],
  onChange,
  placeholder = "اختر أنواع البروتين",
  label = "الكلمات",
  options = [],
  multiple = true,
  error = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (multiple) {
      if (value.includes(opt.value)) {
        onChange(value.filter((v) => v !== opt.value));
      } else {
        onChange([...value, opt.value]);
      }
    } else {
      onChange([opt.value]); // single select
      setOpen(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    }
    if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        toggleOption(filteredOptions[highlightedIndex]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="text-sm font-semibold text-[#476171]">{label}</label>
      )}

   
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={`flex items-center  justify-between w-full border rounded-lg px-3 py-[9.6px] bg-white text-sm shadow-sm transition ${
          error
            ? "border-red-400 focus:ring-red-100"
            : "border-gray-300 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        }`}
      >
        <span
          className={value.length === 0 ? "text-gray-400" : "text-[#476171]"}
        >
          {value.length === 0
            ? placeholder
            : multiple
            ? "Edit Options"
            : options.find((o) => o.value === value[0])?.label}
        </span>
        <IoChevronDown
          className={`ml-2 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
   {/* Selected tags */}
      {multiple && (
        <div className="flex flex-wrap mt-2 gap-2">
          {value.map((val, index) => {
            const option = options.find((o) => o.value === val);
            return (
              <div
                key={index}
                className="flex items-center gap-1 bg-[#E8E1DC] text-[#476171] px-3 py-1 rounded-full text-sm shadow-sm"
              >
                <span>{option?.label ?? String(val ?? "")}</span>
                <button
                  type="button"
                  onClick={() => removeTag(val)}
                  className="text-[#476171] cursor-pointer hover:text-red-500 transition"
                >
                  <IoClose size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown options */}
      {open && (
        <div className="absolute mt-19 w-full border border-gray-200 rounded-lg shadow-lg bg-white z-20">
          {/* Search box */}
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder="Search..."
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => toggleOption(opt)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition ${
                    i === highlightedIndex ? "bg-blue-100" : ""
                  } ${
                    value.includes(opt.value) ? "bg-blue-50 font-medium" : ""
                  }`}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={value.includes(opt.value)}
                      readOnly
                      className="text-blue-500"
                    />
                  )}
                  <span>{opt.label}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-400 text-sm"> No Results </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputTags;
