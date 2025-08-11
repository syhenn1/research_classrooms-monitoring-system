import React, { useState, useEffect } from "react";

const AlertCard = ({ message, interval = 3000, type = "merah" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const typeColors = {
    merah: "bg-red-500",
    kuning: "bg-yellow-500",
    hijau: "bg-green-500",
  };

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-close
    let hideTimer;
    if (interval > 0) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, interval);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [interval]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`
        fixed top-0 left-0 w-full
        ${typeColors[type] || typeColors.merah}
        text-white text-center
        p-2 shadow z-50
        transition-transform duration-500 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="relative flex items-center">
        <span className="flex-grow">{message}</span>
        <button
          onClick={handleClose}
          className="right-4 text-xl font-bold hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
