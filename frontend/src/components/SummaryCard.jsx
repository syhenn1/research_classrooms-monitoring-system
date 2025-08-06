import React from 'react';
import { FiAlertTriangle, FiBookOpen, FiClock } from 'react-icons/fi';

const SummaryCard = ({ sessionDetails, totalDisruption, theoryDuration, totalCheating, quizDuration }) => {
  if (!sessionDetails) return null;

  return (
    <div className="w-full h-full p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col">
      <div className="mb-6">
        <p className="text-gray-400 text-sm">Session Result for</p>
        <h2 className="text-3xl font-bold text-white">{sessionDetails.session_name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Started on {sessionDetails.date} at {sessionDetails.time}
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Bagian Teori / Disruption */}
        <div className="bg-dark-blue p-4 rounded-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-indigo-300">
              <FiBookOpen size={20} />
              <h3 className="font-semibold">Theory Phase</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiClock size={14} />
              <span>{theoryDuration}</span>
            </div>
          </div>
          <div className="mt-2 text-4xl font-bold">{totalDisruption} <span className="text-xl font-medium text-gray-400">Disruptions</span></div>
        </div>

        {/* Bagian Kuis / Cheating */}
        <div className="bg-dark-blue p-4 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-400">
              <FiAlertTriangle size={20} />
              <h3 className="font-semibold">Quiz Phase</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiClock size={14} />
              <span>{quizDuration}</span>
            </div>
          </div>
          <div className="mt-2 text-4xl font-bold">{totalCheating} <span className="text-xl font-medium text-gray-400">Cheating Events</span></div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;