import { useEffect, useState, useRef } from "react";

const MonitorScreen = ({ type }) => {
  const [setLogs] = useState([]);
  const [setEventCounts] = useState({}); // Counter kejadian
  const activeLabels = useRef({}); // Untuk tracking deteksi aktif

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/logs");
        const data = await res.json();
        setLogs(data);

        // Deteksi durasi label yang aktif
        const now = Date.now();
        const latestLabels = new Set(data.map((log) => log.label));

        // Update label aktif dan durasinya
        Object.entries(activeLabels.current).forEach(([label, obj]) => {
          if (!latestLabels.has(label)) {
            delete activeLabels.current[label]; // label hilang → reset
          }
        });

        latestLabels.forEach((label) => {
          if (!activeLabels.current[label]) {
            activeLabels.current[label] = {
              start: now,
              recorded: false,
            };
          } else {
            const duration = now - activeLabels.current[label].start;
            if (duration >= 5000 && !activeLabels.current[label].recorded) {
              // Sudah lebih dari 5 detik → hitung sebagai 1 kejadian
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
    const interval = setInterval(fetchLogs, 1000); // Cek tiap detik

    return () => clearInterval(interval);
  }, [setEventCounts, setLogs]);

  return (
    <div className="w-full h-screen overflow-hidden">
      <img
        src={`http://localhost:8000/video_feed/${type}`} // Corrected template literal
        alt="Video Stream"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default MonitorScreen;
