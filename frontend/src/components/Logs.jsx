import { useEffect, useState, useRef } from "react";

const Logs = ({ activeSessionId }) => {
  const [logs, setLogs] = useState([]);
  const [setEventCounts] = useState({}); // Counter kejadian

  useEffect(() => {
    if (!activeSessionId) return; // Kalau belum ada sessionId, jangan fetch

    const fetchLogs = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/logs/${activeSessionId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setLogs(data);

        // ...log duration detection code tetap sama...
      } catch (err) {
        console.error("Gagal ambil logs:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1000);

    return () => clearInterval(interval);
  }, [activeSessionId, setEventCounts]);

  return (
    <div className="bg-[#113F67] p-4 w-full h-full shadow overflow-y-auto">
      <ul className="space-y-1 text-sm w-full break-words">
        {logs.map((log, index) => (
          <li key={index} className="w-full">
            ({log.classtype}){" - "}
            <strong>{log.label}</strong> ({log.confidence}%) at{" "}
            {new Date(log.time).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Logs;
