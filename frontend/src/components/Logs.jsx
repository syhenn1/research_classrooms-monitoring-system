import { useEffect, useState, useRef } from "react";

const Logs = () => {
  const [logs, setLogs] = useState([]);
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
  }, [setEventCounts]);

  return (
    <div className="bg-[#EEEEEE] p-4 w-full h-full shadow overflow-y-auto">
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
