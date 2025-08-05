import React, { useState, useEffect, useRef } from 'react';
import { FiPlayCircle } from 'react-icons/fi';
import { GoDotFill } from 'react-icons/go';
import CameraControls from './CameraControls';

const LivePreviewPanel = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [videoDevices, setVideoDevices] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(cameras);
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (isCameraOn && videoDevices.length > 0) {
        const constraints = {
          video: {
            deviceId: { exact: videoDevices[cameraIndex].deviceId }
          }
        };
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error starting camera:", error);
          setIsCameraOn(false); // Matikan jika ada error
        }
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera(); // Cleanup function untuk mematikan kamera saat komponen hilang
    };
  }, [isCameraOn, cameraIndex, videoDevices]);

  const handleToggleCamera = () => setIsCameraOn(prev => !prev);
  const handleNextCamera = () => setCameraIndex(prev => (prev + 1) % videoDevices.length);
  const handlePrevCamera = () => setCameraIndex(prev => (prev - 1 + videoDevices.length) % videoDevices.length);

  return (
    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl space-y-4 border border-white/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-red-400">
          <GoDotFill size={24} className={isCameraOn ? "animate-pulse" : ""} />
          <h3 className="font-semibold text-gray-200">Live Preview</h3>
        </div>
        <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center mt-4 overflow-hidden">
          {isCameraOn ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className='text-center'>
              <FiPlayCircle className="text-gray-600 text-5xl"/>
              <p className="text-gray-500 mt-2">Camera feed is off</p>
            </div>
          )}
        </div>
      </div>
      <CameraControls 
        isCameraOn={isCameraOn}
        onToggleCamera={handleToggleCamera}
        onPrevCamera={handlePrevCamera}
        onNextCamera={handleNextCamera}
        cameraIndex={cameraIndex}
        totalCameras={videoDevices.length || 1}
      />
    </div>
  );
};

export default LivePreviewPanel;