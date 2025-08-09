import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MonitorScreen from "../components/MonitorScreen";
import Logs from "../components/Logs";
import Counter from "../components/Counter";
import EndMonitoring from "../components/EndMonitoring";
import SwitchQuiz from "../components/SwitchQuiz";

const MonitoringPage = () => {
  const [mode, setMode] = useState("theory");
  const [quizStarted, setQuizStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
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
        setSessionId(data.session_id); // simpan session_id ke state
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
    <div>
      <div className="p-16 gap-8 w-full flex flex-col h-screen md:flex-row">
        <div className="flex flex-col w-full gap-2">
          <h1 className="text-3xl font-bold mb-4">
            Monitoring Kelas {sessionId ? `- ${sessionId}` : ""}
          </h1>
          <MonitorScreen type={mode} />
          <Counter />
        </div>
        <div className="flex flex-col w-full md:w-1/3 gap-2 h-full">
          <h1 className="text-3xl mb-4">Activity Log</h1>
          <div className="flex-1 overflow-y-auto rounded-xl">
            <Logs activeSessionId={sessionId} />
          </div>
          <SwitchQuiz switchmode={switchToQuiz} disabled={quizStarted} />
          <EndMonitoring onEnd={handleEndMonitoring} />
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
