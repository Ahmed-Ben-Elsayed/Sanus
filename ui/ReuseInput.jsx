import React from "react";

const ReusableInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  icon: Icon = null,
  disabled = "",
  className = "",
  max,
  custclassName = "",
  error = "",
  readOnly = false,
  maxLength="",
  ...rest
}) => {
  const isDate = type === "date";
  const isNumber = type === "number";

  return (
    <div className={`flex flex-col gap-1 w-full max-w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-bold text-[#476171] mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          type={type}
          name={name}
          disabled={disabled}
          max={max}
          value={value}
          maxLength={maxLength}
          onChange={(e) => {
            if (isNumber) {
              const val = e.target.value;
              if (val === "" || Number(val) >= 0) {
                onChange(e);
              }
            } else {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          readOnly={readOnly}
          min={isNumber ? 0 : undefined}
          className={`
            w-full text-sm px-3 py-[10px] pr-10 rounded-lg border bg-white text-[#476171] transition
            ${custclassName}
            ${error ? "border-red-500" : "border-gray-300"}
            outline-none focus:border-[#476171]
            ${isDate ? "appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:end-3 " : ""}
          `}
          {...rest}
        />

        {isDate && (
          <img
            className="w-[18px] end-3 top-1/2 -translate-y-1/2 absolute pointer-events-none"
            alt=""
            src="/Date.png"
          />
        )}

        {Icon && (
          <Icon className="text-xl text-[#476171] end-10 top-1/2 -translate-y-1/2 absolute pointer-events-none" />
        )}
      </div>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};

export default ReusableInput;
