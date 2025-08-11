import React from 'react';
import { FiPlay, FiPause, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CameraControls = ({ 
  isCameraOn, 
  onToggleCamera, 
  onPrevCamera, 
  onNextCamera, 
  cameraIndex, 
  totalCameras,
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onToggleCamera}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          disabled 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : isCameraOn
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isCameraOn ? <FiPause size={16} /> : <FiPlay size={16} />}
        {isCameraOn ? 'Stop' : 'Start'}
      </button>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevCamera}
          disabled={disabled || totalCameras <= 1}
          className={`p-2 rounded-lg transition-colors ${
            disabled || totalCameras <= 1
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <FiChevronLeft size={16} />
        </button>
        
        <span className="text-sm px-2 py-1 bg-white/10 rounded">
          {cameraIndex + 1}/{totalCameras}
        </span>
        
        <button
          onClick={onNextCamera}
          disabled={disabled || totalCameras <= 1}
          className={`p-2 rounded-lg transition-colors ${
            disabled || totalCameras <= 1
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CameraControls;