import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlayCircle } from 'react-icons/fi';
import { GoDotFill } from 'react-icons/go';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isGazeDetectionOn, setIsGazeDetectionOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartMonitoring = () => {
    navigate('/monitoring');
  };

  const time = currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = currentDateTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-blue text-white font-sans animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Session Configuration</h1>
        <p className="text-gray-300">Please set up the details for the monitoring session.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kolom Kiri: Form Setup */}
        <div className="bg-white/5 p-6 rounded-lg space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-400">Time & Date</label>
            <p className="text-lg font-semibold">{`${time} | ${date}`}</p>
          </div>
          
          <div>
            <label htmlFor="event-name" className="block text-sm font-medium text-gray-300 mb-1">Event Name</label>
            <input
              type="text"
              id="event-name"
              placeholder="Example: Final Exam - Mathematics"
              className="w-full px-4 py-2 bg-dark-blue border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-300 mb-1">Class</label>
            <select id="class" className="w-full px-4 py-2 bg-dark-blue border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition">
              <option>Choose the Class</option>
              <option>TI-4A</option>
              <option>TI-4B</option>
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
            <select id="subject" className="w-full px-4 py-2 bg-dark-blue border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition">
              <option>Choose the Subject</option>
              <option>Advanced Programming</option>
              <option>Artificial Intelligence</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <GoDotFill size={24} className="animate-pulse" />
            <h3 className="font-semibold text-gray-200">Live Preview</h3>
          </div>
          
          <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center">
            <FiPlayCircle className="text-gray-600 text-5xl"/>
            <p className="text-gray-500 ml-2">Camera feed is off</p>
          </div>
          
          <div className="flex items-center justify-between bg-dark-blue p-3 rounded-lg">
            <span className="font-medium text-gray-300">Cheating Detection</span>
            <button 
              onClick={() => setIsGazeDetectionOn(!isGazeDetectionOn)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${isGazeDetectionOn ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isGazeDetectionOn ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button onClick={handleStartMonitoring} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105">
          Start Monitoring
        </button>
      </div>
    </div>
  );
};

export default HomePage;