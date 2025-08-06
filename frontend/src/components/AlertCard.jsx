import React, { useState } from "react";

const AlertCard = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`
        fixed top-0 left-0 w-full
        bg-red-500 text-white text-center
        p-2 shadow z-50
        transition-transform duration-500 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="relative flex">
        <span className="flex-grow mt-1">{message}</span>
        <button
          onClick={handleClose}
          className="right-4 text-xl font-bold hover:text-gray-200 transition pb-1"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
