import React, { useEffect, useState } from "react";

export default function ResultCard({
  title = "Detected Logs",
  unit = "Logs",
  barColor = "bg-blue-500",
  classtype = "", // parameter classtype
}) {
  const [logCount, setLogCount] = useState(0);
  const [durationStr, setDurationStr] = useState("");

  useEffect(() => {
    const fetchLogCount = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/logs");
        if (response.ok) {
          const data = await response.json();

          const filteredLogs = classtype
            ? data.filter(
                (log) => log.classtype.toLowerCase() === classtype.toLowerCase()
              )
            : data;

          if (unit === "duration" && filteredLogs.length > 1) {
            // Sort logs by time
            const times = filteredLogs
              .map((log) => new Date(log.time))
              .sort((a, b) => a - b);

            const diffMs = times[times.length - 1] - times[0]; // duration in ms
            const diffSeconds = Math.floor(diffMs / 1000);

            const hours = Math.floor(diffSeconds / 3600);
            const minutes = Math.floor((diffSeconds % 3600) / 60);
            const seconds = diffSeconds % 60;

            let durationStr = "";
            if (hours > 0) durationStr += `${hours} Jam `;
            if (minutes > 0) durationStr += `${minutes} Menit `;
            durationStr += `${seconds} Detik`;

            setDurationStr(durationStr.trim());
          } else {
            setLogCount(filteredLogs.length);
          }
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };

    fetchLogCount(); // initial
    const interval = setInterval(fetchLogCount, 5000); // refresh setiap 5s

    return () => clearInterval(interval);
  }, [classtype, unit]);

  return (
    <div className="w-full p-4 rounded-2xl shadow-md bg-white flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900">
          {unit === "duration" ? durationStr : logCount}
          {unit && (
            <span className="text-lg font-medium text-gray-500 ml-1">
              {unit}
            </span>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor}`}
          style={{
            width: unit === "duration" ? "100%" : `${Math.min(100, logCount)}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
