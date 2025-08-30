import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import SessionCard from "../components/SessionCard";
import { FiArchive, FiArrowLeft, FiPlusCircle, FiSearch } from "react-icons/fi";

// Komponen terpisah untuk UI Paginasi
const Pagination = ({ sessionsPerPage, totalSessions, paginate, currentPage }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalSessions / sessionsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (pageNumbers.length <= 1) return null; // Jangan tampilkan jika hanya ada 1 halaman

  return (
    <nav className="mt-8 flex justify-center">
      <ul className="inline-flex items-center -space-x-px">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-2 leading-tight border border-white/20 transition-colors duration-200
                ${currentPage === number
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }
                ${number === 1 ? 'rounded-l-lg' : ''}
                ${number === pageNumbers.length ? 'rounded-r-lg' : ''}
              `}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};


export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk fungsionalitas baru
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 3; // Menampilkan 6 kartu per halaman

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/sessions");
        if (!res.ok) throw new Error("Gagal mengambil riwayat sesi dari server");
        const data = await res.json();
        setSessions(data.sort((a, b) => new Date(b.date) - new Date(a.date) || b.time.localeCompare(a.time)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Filter sesi berdasarkan searchTerm
  const filteredSessions = useMemo(() => {
    return sessions.filter(session =>
      session.session_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);
  
  // Logika untuk Paginasi
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);

  // Fungsi untuk mengubah halaman
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Kembali ke halaman pertama setiap kali user mengetik
  };

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
    if (currentSessions.length === 0) {
       return <div className="text-center text-gray-500 mt-16">No sessions found for "{searchTerm}".</div>;
    }

    return (
      <>
        <div className="space-y-6"> {/* Mengubah layout menjadi satu kolom */}
          {currentSessions.map((s, index) => (
            <div key={s.session_id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <SessionCard session={s} />
            </div>
          ))}
        </div>
        <Pagination
          sessionsPerPage={sessionsPerPage}
          totalSessions={filteredSessions.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </>
    );
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans">
      <header className="pb-3 mb-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session History</h1>
            <p className="text-gray-400">Review past monitoring session results.</p>
          </div>
          <Link
            to="/home"
            className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-x-1"
          >
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by session name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </header>

      {renderContent()}
    </div>
  );
}