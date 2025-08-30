import React from "react";

const Modal = ({
  open,
  onClose,
  onConfirm,
  showActions = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-40">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative z-50 bg-white rounded-xl p-6 max-w-lg w-full shadow-lg animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-2 right-3 text-xl text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        {/* Content */}
        <div className="text-sm text-gray-800">{children}</div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1 cursor-pointer rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-1 cursor-pointer rounded-md bg-[#4a6375] text-white hover:bg-[#3a5160] text-sm"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
