import React, { useState, useEffect } from "react";

export default function LogsDetail({ sessionId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/logs/${sessionId}`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Gagal ambil logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [sessionId]);

  if (loading) return <p className="text-gray-400">Loading logs...</p>;
  if (!logs.length) return <p className="text-gray-500">Tidak ada log pada sesi ini.</p>;

  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.classtype]) acc[log.classtype] = {};
    if (!acc[log.classtype][log.label]) acc[log.classtype][log.label] = [];
    acc[log.classtype][log.label].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <p className="text-gray-300">Total Logs: <span className="font-bold">{logs.length}</span></p>
      {Object.keys(grouped).map((classtype) => (
        <div key={classtype} className="border border-gray-600 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2 capitalize">{classtype}</h4>
          {Object.keys(grouped[classtype]).map((label) => (
            <div key={label} className="mb-4">
              <p className="font-medium text-yellow-300">{label} ({grouped[classtype][label].length})</p>
              <ul className="ml-4 text-sm text-gray-300 space-y-1">
                {grouped[classtype][label].map((log) => (
                  <li key={log.id}>
                    Confidence: {log.confidence.toFixed(2)} | Time: {log.time}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
