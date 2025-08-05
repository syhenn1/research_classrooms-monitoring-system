import React from 'react';
import { FiChevronLeft, FiChevronRight, FiVideo, FiVideoOff } from 'react-icons/fi';

const CameraControls = ({ 
  isCameraOn, 
  onToggleCamera, 
  onPrevCamera, 
  onNextCamera, 
  cameraIndex, 
  totalCameras 
}) => (
  <div className="bg-dark-blue p-3 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <button 
        onClick={onToggleCamera} 
        className="p-2 bg-white/10 rounded-full hover:bg-indigo-500 transition-colors duration-200"
        title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
      >
        {isCameraOn ? <FiVideo /> : <FiVideoOff />}
      </button>
      <span className="font-medium text-gray-300">
        {isCameraOn ? "Camera is On" : "Camera is Off"}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={onPrevCamera} 
        className="p-2 bg-white/10 rounded-full hover:bg-indigo-500 transition-colors duration-200"
      >
        <FiChevronLeft />
      </button>
      <button 
        onClick={onNextCamera} 
        className="p-2 bg-white/10 rounded-full hover:bg-indigo-500 transition-colors duration-200"
      >
        <FiChevronRight />
      </button>
    </div>
  </div>
);

export default CameraControls;