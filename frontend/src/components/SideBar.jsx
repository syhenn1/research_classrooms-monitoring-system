import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiMonitor, FiBarChart2, FiLogOut, FiXCircle } from "react-icons/fi";
import ConfirmationModal from "./ConfirmationModal";
import AlertCard from "./AlertCard";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef(location.pathname); // Simpan path sebelumnya

  const isFlowLocked = location.pathname.startsWith("/monitoring");

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/active-session", {
          credentials: "include",
        });
        const data = await response.json();
        setHasActiveSession(!!data.session);
      } catch (error) {
        console.error("Failed to fetch active session", error);
        setHasActiveSession(false);
      }
    };

    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, []);

  // Tangkap reload/tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFlowLocked && hasActiveSession) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFlowLocked, hasActiveSession]);

  // Pantau perubahan route, termasuk via back/forward browser
  useEffect(() => {
    if (
      prevPathRef.current !== location.pathname && // Path berubah
      hasActiveSession &&
      prevPathRef.current.startsWith("/monitoring") && // Awalnya di monitoring
      !location.pathname.startsWith("/monitoring") // Sekarang keluar dari monitoring
    ) {
      setPendingRoute(location.pathname);
      setShowExitConfirm(true);
      navigate(prevPathRef.current, { replace: true }); // Kembalikan ke halaman lama
    }
    prevPathRef.current = location.pathname;
  }, [location, hasActiveSession, navigate]);

  const handleProtectedNavigation = (route) => {
    if (isFlowLocked && hasActiveSession && route !== "/monitoring" && route !== "/result") {
      setPendingRoute(route);
      setShowExitConfirm(true);
    } else {
      navigate(route);
    }
  };

  const handleExitSession = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/session/end", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Gagal mengakhiri sesi:", err);
    }
    setShowExitConfirm(false);
    if (pendingRoute) navigate(pendingRoute);
  };

  return (
    <>
      {/* Alert session status */}
      {!hasActiveSession &&
        !isFlowLocked &&
        !location.pathname.startsWith("/result") && (
          <AlertCard
            message="Tidak ada sesi aktif, tolong mulai sesi terlebih dahulu."
            type="merah"
            interval={2500}
          />
        )}
      {isFlowLocked && !location.pathname.startsWith("/result") && (
        <AlertCard
          message="Anda sedang dalam sesi monitoring, harap selesaikan sesi anda dahulu"
          type="hijau"
          interval={3000}
        />
      )}

      {/* Popup konfirmasi keluar
      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleExitSession}
        onDeny={() => setShowExitConfirm(false)}
        title="Sesi Monitoring Aktif"
        message="Anda yakin ingin keluar? Sesi tidak akan disimpan dan progress akan hilang."
        confirmText="Keluar & Hentikan Sesi"
        denyText="Batal"
        confirmIcon={<FiLogOut />}
        denyIcon={<FiXCircle />}
        showCloseButton={false}
      /> */}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-48" : "w-2"}
          group
          z-50
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div
          className={`
            flex flex-col items-center
            transition-all duration-300 ease-in-out
            space-y-4
            ${isExpanded ? "bg-dark-blue p-4 rounded-2xl shadow-lg" : ""}
          `}
        >
          <SideBarLink
            icon={FiHome}
            isExpanded={isExpanded}
            onClick={() => handleProtectedNavigation("/home")}
          />
          <SideBarLink
            icon={FiMonitor}
            isExpanded={isExpanded}
            onClick={() => handleProtectedNavigation("/monitoring")}
          />
          <SideBarLink
            icon={FiBarChart2}
            isExpanded={isExpanded}
            onClick={() => handleProtectedNavigation("/result")}
          />
        </div>
      </aside>
    </>
  );
};

const SideBarLink = ({ icon: Icon, isExpanded, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center transition-all duration-300 ease-in-out w-10 h-10 rounded-lg hover:bg-indigo-600"
    >
      <Icon
        size={20}
        className={`transition-opacity duration-200 text-white ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
};

export default SideBar;
