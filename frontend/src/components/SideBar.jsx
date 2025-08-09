import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiMonitor, FiBarChart2 } from 'react-icons/fi';
import AlertCard from './AlertCard';

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const location = useLocation();

  // Cek apakah lagi di halaman flow ujian
  const isFlowLocked =
    location.pathname.startsWith('/monitoring') ||
    location.pathname.startsWith('/result');

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/active-session', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.session) {
          setHasActiveSession(true);
        } else {
          setHasActiveSession(false);
        }
      } catch (error) {
        console.error('Failed to fetch active session', error);
        setHasActiveSession(false);
      }
    };

    fetchActiveSession();

    const interval = setInterval(fetchActiveSession, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {!hasActiveSession && !isFlowLocked && (
        <AlertCard message="No active session selected. Please create or select a session." />
      )}

      {isFlowLocked && (
        <AlertCard message="Anda sedang dalam sesi monitoring, harap selesaikan sesi anda dahulu" />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-48' : 'w-2'}
          group
          z-50
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div
          className={`
            flex flex-col items-center
            transition-all duration-300 ease-in-out
            space-y-4
            ${isExpanded ? 'bg-dark-blue p-4 rounded-2xl shadow-lg' : ''}
          `}
        >
          <SideBarLink
            to="/home"
            icon={FiHome}
            isExpanded={isExpanded}
            disabled={isFlowLocked || !hasActiveSession}
            lockReason={isFlowLocked ? 'Selesaikan Sesi anda dahulu.' : ''}
          />
          <SideBarLink
            to="/monitoring"
            icon={FiMonitor}
            isExpanded={isExpanded}
            disabled={isFlowLocked || !hasActiveSession}
            lockReason={isFlowLocked ? 'Selesaikan Sesi anda dahulu.' : ''}
          />
          <SideBarLink
            to="/result"
            icon={FiBarChart2}
            isExpanded={isExpanded}
            disabled={isFlowLocked || !hasActiveSession}
            lockReason={isFlowLocked ? 'Selesaikan Sesi anda dahulu.' : ''}
          />
        </div>
      </aside>
    </>
  );
};

const SideBarLink = ({ to, icon: Icon, isExpanded, disabled = false, lockReason = '' }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      alert(lockReason || 'No active session! Please create/select one first.');
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        w-10 h-10 rounded-lg
        ${disabled ? 'cursor-not-allowed' : 'hover:bg-indigo-600'}
      `}
    >
      <Icon
        size={20}
        className={`
          transition-opacity duration-200
          ${disabled ? 'text-gray-300' : 'text-white'}
          ${isExpanded ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </button>
  );
};

export default SideBar;
