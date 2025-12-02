import React from "react";

const NewButton = ({
  children,
  onClick,
  className = "",
  icon: Icon,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-[#476171] cursor-pointer text-white hover:bg-[#2A3C47] flex items-center justify-center gap-2 py-[10px] px-5 rounded-md h-max ${className}`}
    {...props}
  >
    {children}
    {Icon && <Icon className="text-md" />}
  </button>
);

export default NewButton;