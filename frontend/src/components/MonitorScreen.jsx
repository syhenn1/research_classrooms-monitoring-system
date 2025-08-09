import { useEffect, useState, useRef } from "react";

const MonitorScreen = ({ type }) => {
  const [, setLogs] = useState([]); // State untuk data log
  const [, setEventCounts] = useState({}); // Counter kejadian
  const activeLabels = useRef({}); // Untuk tracking deteksi aktif

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/logs");
        const data = await res.json();
        setLogs(data);

        const now = Date.now();
        const latestLabels = new Set(data.map((log) => log.label));

        // Reset label yang hilang
        Object.keys(activeLabels.current).forEach((label) => {
          if (!latestLabels.has(label)) {
            delete activeLabels.current[label];
          }
        });

        // Update label aktif
        latestLabels.forEach((label) => {
          if (!activeLabels.current[label]) {
            activeLabels.current[label] = {
              start: now,
              recorded: false,
            };
          } else {
            const duration = now - activeLabels.current[label].start;
            if (duration >= 5000 && !activeLabels.current[label].recorded) {
              setEventCounts((prev) => ({
                ...prev,
                [label]: (prev[label] || 0) + 1,
              }));
              activeLabels.current[label].recorded = true;
            }
          }
        });
      } catch (err) {
        console.error("Gagal ambil logs:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <img
        src={`http://127.0.0.1:8000/video_feed/${type}`}
        alt="Video Stream"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default MonitorScreen;
