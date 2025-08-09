import React, { useState, useEffect } from 'react';

import SessionHeader from '../components/SessionHeader';
import SessionSetupForm from '../components/SessionSetupForm';
import LivePreviewPanel from '../components/LivePreviewPanel';

const HomePage = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = currentDateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const date = currentDateTime.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans animate-fade-in">
      <SessionHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <LivePreviewPanel />
        
        <div className="flex flex-col">
          <SessionSetupForm time={time} date={date} />
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;