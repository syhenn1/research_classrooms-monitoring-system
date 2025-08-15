import React, { useState, useEffect } from 'react';
import SessionList from '../components/SessionList';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/sessions');
        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server');
        }
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-16 text-xl">Loading history...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 mt-16 text-xl">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-6">
        Session History
      </h1>
      <SessionList sessions={sessions} />
    </div>
  );
}