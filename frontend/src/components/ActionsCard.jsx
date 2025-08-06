import React from 'react';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';

const ActionsCard = ({ onExport, onFinish }) => {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
      <h3 className="text-xl font-semibold text-gray-200">Actions</h3>
      
      <button 
        onClick={onExport}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all">
        <FiDownload />
        Export to Excel (.xlsx)
      </button>

      <button 
        onClick={onFinish}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all">
        <FiArrowLeft />
        Finish & Return to Home
      </button>
    </div>
  );
};

export default ActionsCard;