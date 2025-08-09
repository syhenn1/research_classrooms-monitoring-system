import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MonitorScreen from "../components/MonitorScreen";
import Logs from "../components/Logs";
import Counter from "../components/Counter";
import EndMonitoring from "../components/EndMonitoring";
import SwitchQuiz from "../components/SwitchQuiz";
import { GoDotFill } from "react-icons/go";


const MonitoringPage = () => {
  const [mode, setMode] = useState("theory");
  const [quizStarted, setQuizStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [session_name, setSessionName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil session_id dari query param saat pertama render (jika ada)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("session_id");
    if (id) {
      setSessionId(id);
    } else {
      // Jika tidak ada di URL, fetch active session dari backend
      fetch("http://127.0.0.1:8000/api/active-session", {
        credentials: "include", // supaya cookies / session terikut
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
          // Kalau gak ada session aktif, redirect misalnya ke setup page
          navigate("/setup");
        });
    }
  }, [location.search, navigate]);

  const switchToQuiz = () => {
    setMode("quiz");
    setQuizStarted(true);
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
        // simpan session_id ke state
        navigate(`/result?session_id=${data.session_id}`);
      } else {
        navigate("/setup");
      }
      return data;
    } catch (err) {
      console.error("Gagal mengakhiri sesi:", err);
      navigate("/result");
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans animate-fade-in">
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

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Monitor & Counter */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <MonitorScreen type={mode} />
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center">
            <Counter />
          </div>
        </div>

        {/* Activity Log & Controls */}
        <div className="flex flex-col gap-6">
          <div className="backdrop-blur-sm rounded-2xl border p-4 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
            <div className="flex-1 overflow-y-auto rounded-lg border border-white/10">
              <Logs activeSessionId={sessionId} />
            </div>
          </div>

          <div className="space-y-3">
            <SwitchQuiz switchmode={switchToQuiz} disabled={quizStarted} />
            <EndMonitoring onEnd={handleEndMonitoring} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
