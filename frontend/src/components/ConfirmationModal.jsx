import React from 'react';
import { FiSave, FiLogOut } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, onDeny }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-blue border border-white/10 rounded-xl shadow-lg p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold text-white mb-2">Finish Session</h2>
        <p className="text-gray-300 mb-6">Do you want to save the session summary as an Excel file before returning home?</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all">
            <FiSave />
            Save as .xlsx & Finish
          </button>
          
          <button 
            onClick={onDeny}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all">
            <FiLogOut />
            Finish without Saving
          </button>

          <button 
            onClick={onClose}
            className="w-full mt-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;