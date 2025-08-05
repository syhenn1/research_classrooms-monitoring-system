import React from 'react';

const StartMonitoringButton = ({ onClick }) => (
  <div className="mt-8 flex justify-start">
    <button
      onClick={onClick}
      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
    >
      Start Monitoring
    </button>
  </div>
);

export default StartMonitoringButton;
