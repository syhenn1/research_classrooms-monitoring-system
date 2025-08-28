import React, { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiCalendar, FiClock, FiZap } from "react-icons/fi";

const LogsDetail = ({ sessionId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/logs/${sessionId}`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Gagal ambil detail log:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [sessionId]);

  const theoryLogs = logs.filter(log => log.classtype === 'theory');
  const quizLogs = logs.filter(log => log.classtype === 'quiz');

  if (loading) return <p className="text-sm text-gray-400">Loading logs...</p>;
  if (logs.length === 0) return <p className="text-sm text-gray-500 italic">No activity was recorded in this session.</p>;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-indigo-300">Theory Phase Logs</h4>
            <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">{theoryLogs.length} Events Detected</span>
        </div>
        <ul className="space-y-2 text-xs text-gray-400 max-h-32 overflow-y-auto pr-2">
          {theoryLogs.length > 0 ? theoryLogs.map((log, index) => (
            <li key={index} className="flex items-center justify-between p-2 rounded-md bg-white/5">
                <div>
                    <span className="font-bold text-white">{log.label}</span>
                    <span className="text-white/70"> ({log.confidence}%)</span>
                </div>
                <span className="text-white/70 font-mono">{new Date(log.time).toLocaleTimeString()}</span>
            </li>
          )) : <li>No disruption events recorded.</li>}
        </ul>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-red-400">Quiz Phase Logs</h4>
            <span className="text-xs font-medium bg-red-500/20 text-red-300 px-2 py-1 rounded-full">{quizLogs.length} Events Detected</span>
        </div>
        <ul className="space-y-2 text-xs text-gray-400 max-h-32 overflow-y-auto pr-2">
          {quizLogs.length > 0 ? quizLogs.map((log, index) => (
            <li key={index} className="flex items-center justify-between p-2 rounded-md bg-white/5">
                <div>
                    <span className="font-bold text-white">{log.label}</span>
                    <span className="text-white/70"> ({log.confidence}%)</span>
                </div>
                <span className="text-white/70 font-mono">{new Date(log.time).toLocaleTimeString()}</span>
            </li>
          )) : <li>No cheating events recorded.</li>}
        </ul>
      </div>
    </div>
  );
};

const SessionCard = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/logs/${session.session_id}`);
        const data = await res.json();
        setTotalLogs(data.length);  
      } catch (err) {
        console.error("Gagal ambil logs:", err);
      }
    };

    fetchLogs();
  }, [session.session_id]);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-white truncate">{session.session_name}</h3>
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
              <div className="flex items-center gap-1.5"><FiCalendar /><span>{session.date}</span></div>
              <div className="flex items-center gap-1.5"><FiClock /><span>{session.time}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <FiZap size={16}/>
            <span className="font-bold text-lg">{totalLogs}</span>
            <span className="text-sm text-gray-400">Total Logs</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10">
        {isOpen && (
          <div className="p-5 animate-fade-in">
            <LogsDetail sessionId={session.session_id} />
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-center items-center gap-2 p-2 text-xs font-semibold text-gray-400 hover:bg-white/10"
        >
          {isOpen ? 'Hide Details' : 'Show Details'}
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
    </div>
  );
};

export default SessionCard;