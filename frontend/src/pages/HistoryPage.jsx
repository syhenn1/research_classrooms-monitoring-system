import React, { useState, useEffect } from "react";
import SessionCard from "../components/SessionCard";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/sessions");
        if (!res.ok) throw new Error("Gagal mengambil sesi dari server");
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) return <div className="text-center text-gray-400 mt-16">Loading history...</div>;
  if (error) return <div className="text-center text-red-500 mt-16">{error}</div>;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans">
      <h1 className="text-3xl font-bold border-b border-gray-600 pb-3 mb-6">Session History</h1>
      <div className="flex flex-col gap-6">
        {sessions.map((s) => (
          <SessionCard key={s.session_id} session={s} />
        ))}
      </div>
    </div>
  );
}
