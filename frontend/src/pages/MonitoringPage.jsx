import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MonitorScreen from "../components/MonitorScreen";
import Logs from "../components/Logs";
import Counter from "../components/Counter";
import { GoDotFill } from "react-icons/go";
import ConfirmationModal from "../components/ConfirmationModal";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const MonitoringPage = () => {
  const [mode, setMode] = useState("theory");
  const [quizStarted, setQuizStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [session_name, setSessionName] = useState("");
  const [showQuizConfirm, setShowQuizConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false); // ✅ modal end monitoring

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("session_id");
    if (id) {
      setSessionId(id);
    } else {
      fetch("http://127.0.0.1:8000/api/active-session", {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("No active session");
          return res.json();
        })
        .then((data) => {
          if (data.session && data.session.session_id) {
            setSessionId(data.session.session_id);
            setSessionName(data.session.session_name || "");
          }
        })
        .catch(() => {
          navigate("/home");
        });
    }
  }, [location.search, navigate]);

  const confirmSwitchToQuiz = () => {
    setShowQuizConfirm(true);
  };

  const handleQuizConfirm = () => {
    setMode("quiz");
    setQuizStarted(true);
    setShowQuizConfirm(false);
  };

  const handleEndMonitoring = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/session/end", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        navigate(`/result?session_id=${data.session_id}`);
      } else {
        navigate("/home");
      }
      return data;
    } catch (err) {
      console.error("Gagal mengakhiri sesi:", err);
      navigate("/result");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-blue text-white font-sans animate-fade-in p-8">
      {/* Header */}
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
          <GoDotFill size={24} className="text-red-400 animate-pulse" />
          Monitoring Kelas {session_name ? `- ${session_name}` : ""}
        </h1>
        <p className="text-gray-400 mt-2">
          Live feed & aktivitas peserta ujian secara real-time.
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Live Monitor & Counter */}
        <div className="lg:col-span-2 flex flex-col gap-2 min-h-0">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex-1 overflow-hidden min-h-0">
            <MonitorScreen type={mode} />
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/10 text-center">
            <Counter />
          </div>
        </div>

        {/* Activity Log & Controls */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="backdrop-blur-sm rounded-lg border p-3 flex-1 flex flex-col min-h-0">
            <h2 className="text-sm font-semibold mb-2">Activity Log</h2>
            <div className="flex-1 overflow-y-auto rounded border border-white/10 p-2">
              <Logs activeSessionId={sessionId} />
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={confirmSwitchToQuiz}
              disabled={quizStarted}
              className={`w-full py-2 text-lg rounded-lg font-semibold transition-colors ${
                quizStarted
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
                  
              }`}
            >
              Pindah ke Mode Quiz
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="w-full py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 transition-colors text-lg"
            >
              Akhiri Monitoring
            </button>
          </div>
        </div>
      </div>

      {/* Modal Pindah ke Quiz */}
      <ConfirmationModal
        isOpen={showQuizConfirm}
        onClose={() => setShowQuizConfirm(false)}
        onConfirm={handleQuizConfirm}
        onDeny={() => setShowQuizConfirm(false)}
        title="Pindah ke Mode Quiz"
        message="Apakah anda yakin ingin pindah ke mode quiz? Anda tidak dapat kembali."
        confirmText="Ya, Pindah Sekarang"
        denyText="Batalkan"
        confirmIcon={<FiCheckCircle />}
        denyIcon={<FiXCircle />}
        showCloseButton={false}
      />

      {/* Modal Akhiri Monitoring */}
      <ConfirmationModal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleEndMonitoring}
        onDeny={() => setShowEndConfirm(false)}
        title="Akhiri Monitoring"
        message="Apakah Anda yakin ingin mengakhiri sesi monitoring ini? Semua peserta akan otomatis keluar."
        confirmText="Ya, Akhiri"
        denyText="Batalkan"
        confirmIcon={<FiCheckCircle />}
        denyIcon={<FiXCircle />}
        showCloseButton={false}
      />
    </div>
  );
};

export default MonitoringPage;
