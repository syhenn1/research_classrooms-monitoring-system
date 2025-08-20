import React, { useState, useEffect } from "react";

import SessionHeader from "../components/SessionHeader";
import SessionSetupForm from "../components/SessionSetupForm";
import LivePreviewPanel from "../components/LivePreviewPanel";
import ConfirmationModal from "../components/ConfirmationModal";

const HomePage = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = currentDateTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = currentDateTime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans animate-fade-in">
      <SessionHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <LivePreviewPanel />

        <div className="flex flex-col">
          <SessionSetupForm time={time} date={date} />
        </div>
        <button>
          <a
            href="/history"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            History
          </a>
        </button>
      </div>
      <ConfirmationModal
        autoCheckSession={true}
        endSession={true}
        title="Sesi Monitoring Aktif"
        message="Anda berada di luar halaman monitoring. Akhiri sesi sekarang?"
        confirmText="Akhiri Sesi"
        denyText="Kembali ke Monitoring"
        showCloseButton={false}
        confirmButtonColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default HomePage;
