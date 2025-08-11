import React, { useEffect, useState } from "react";
import { FiSave, FiLogOut } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  onDeny,
  title = "Confirmation",
  message = "Are you sure?",
  confirmText = "Confirm",
  denyText = "Cancel",
  confirmIcon = <FiSave />,
  denyIcon = <FiLogOut />,
  showCloseButton = true,
  endSession = false,
  setSessionId,
  autoCheckSession = false,
  confirmButtonColor = "bg-green-500 hover:bg-green-600",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [autoOpen, setAutoOpen] = useState(false);

  const handleEndMonitoring = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/session/end", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.session_id) {
        if (setSessionId) setSessionId(data.session_id);
        navigate(`/result?session_id=${data.session_id}`);
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Gagal mengakhiri sesi:", err);
      navigate("/result");
    }
  };

const handleDenyClick = () => {
  setAutoOpen(false);
  if (endSession) {
    navigate("/monitoring");
  } else {
    if (onDeny) onDeny();
  }
};


  const handleConfirmClick = () => {
    if (endSession) {
      handleEndMonitoring();
    } else {
      if (onConfirm) onConfirm();
    }
  };

  useEffect(() => {
    if (!autoCheckSession) return;

    const checkActiveSession = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/active-session", {
          credentials: "include",
        });
        const data = await res.json();

        // ✅ Cek berdasarkan session_id
        const isSessionActive = Boolean(data?.session?.session_id);

        if (isSessionActive && location.pathname !== "/monitoring") {
          setAutoOpen(true);
        } else {
          setAutoOpen(false);
        }
      } catch (err) {
        console.error("Gagal cek sesi aktif:", err);
      }
    };

    checkActiveSession();
    const intervalId = setInterval(checkActiveSession, 5000);
    return () => clearInterval(intervalId);
  }, [autoCheckSession, location.pathname]);

  if (!isOpen && !autoOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-blue border border-white/10 rounded-xl shadow-lg p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirmClick}
            className={`w-full flex items-center justify-center gap-2 ${confirmButtonColor} text-white font-bold py-3 px-4 rounded-lg transition-all`}
          >
            {confirmIcon}
            {confirmText}
          </button>

          <button
            onClick={ handleDenyClick || onClose }
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all"
          >
            {denyIcon}
            {denyText}
          </button>

          {showCloseButton && (
            <button
              onClick={() => {
                setAutoOpen(false);
                if (onClose) onClose();
              }}
              className="w-full mt-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
