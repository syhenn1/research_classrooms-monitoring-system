import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import SessionCard from "../components/SessionCard";
import { FiArchive, FiArrowLeft, FiPlusCircle } from "react-icons/fi";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/sessions");
        if (!res.ok) throw new Error("Gagal mengambil riwayat sesi dari server");
        const data = await res.json();
        setSessions(data.sort((a, b) => new Date(b.date) - new Date(a.date))); // Urutkan dari terbaru
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="text-center text-gray-400 mt-16">Loading history...</div>;
    if (error) return <div className="text-center text-red-500 mt-16">{error}</div>;
    if (sessions.length === 0) {
      return (
        <div className="text-center text-gray-500 mt-16">
          <FiArchive size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Session History Found</h2>
          <p className="mt-2">Start a new monitoring session to see the results here.</p>
          <Link to="/home" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
            <FiPlusCircle />
            Start New Session
          </Link>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sessions.map((s, index) => (
          <div key={s.session_id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <SessionCard session={s} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans">
      <header className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold">Session History</h1>
          <p className="text-gray-400">Review past monitoring session results.</p>
        </div>
        <Link
          to="/home"
          className="flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-x-1"
        >
          <FiArrowLeft />
          Back to Home
        </Link>
      </header>

      {renderContent()}
    </div>
  );
}