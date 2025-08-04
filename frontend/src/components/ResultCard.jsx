import React, { useEffect, useState } from 'react';

export default function ResultCard({
  title = 'Detected Logs',
  unit = 'Logs',
  barColor = 'bg-blue-500',
  classtype = '', // parameter classtype
}) {
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    const fetchLogCount = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/logs');
        if (response.ok) {
          const data = await response.json();

          // Filter berdasarkan classtype (bukan label!)
          const filteredLogs = classtype
            ? data.filter((log) => log.classtype.toLowerCase() === classtype.toLowerCase())
            : data;

          setLogCount(filteredLogs.length); // Total logs sesuai classtype
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchLogCount(); // initial
    const interval = setInterval(fetchLogCount, 5000); // refresh setiap 5s

    return () => clearInterval(interval);
  }, [classtype]);

  return (
    <div className="w-full p-4 rounded-2xl shadow-md bg-white flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900">
          {logCount}
          {unit && <span className="text-lg font-medium text-gray-500 ml-1">{unit}</span>}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${Math.min(100, logCount)}%` }} // Bar max 100%
        ></div>
      </div>
    </div>
  );
}
