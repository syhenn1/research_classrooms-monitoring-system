import React, { useState, useEffect, useRef } from 'react';
import { FiPlayCircle } from 'react-icons/fi';
import { GoDotFill } from 'react-icons/go';
import CameraControls from './CameraControls';

const LivePreviewPanel = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [videoDevices, setVideoDevices] = useState([]);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Cek apakah ada sesi monitoring aktif
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/active-session", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsMonitoringActive(!!data.session);
        } else {
          setIsMonitoringActive(false);
        }
      } catch (error) {
        console.error("Error checking active session:", error);
        setIsMonitoringActive(false);
      }
    };

    // Cek sesi aktif setiap 3 detik
    checkActiveSession();
    intervalRef.current = setInterval(checkActiveSession, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Matikan kamera otomatis jika monitoring aktif
  useEffect(() => {
    if (isMonitoringActive && isCameraOn) {
      setIsCameraOn(false);
    }
  }, [isMonitoringActive]);

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
      if (isCameraOn && videoDevices.length > 0 && !isMonitoringActive) {
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
          setIsCameraOn(false);
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

    if (isCameraOn && !isMonitoringActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn, cameraIndex, videoDevices, isMonitoringActive]);

  const handleToggleCamera = () => {
    if (isMonitoringActive) {
      alert("Tidak dapat menggunakan live preview saat monitoring sedang aktif. Silakan akhiri monitoring terlebih dahulu.");
      return;
    }
    setIsCameraOn(prev => !prev);
  };

  const handleNextCamera = () => setCameraIndex(prev => (prev + 1) % videoDevices.length);
  const handlePrevCamera = () => setCameraIndex(prev => (prev - 1 + videoDevices.length) % videoDevices.length);

  return (
    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl space-y-4 border border-white/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-red-400">
          <GoDotFill size={24} className={isCameraOn ? "animate-pulse" : ""} />
          <h3 className="font-semibold text-gray-200">Live Preview</h3>
          {isMonitoringActive && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
              Monitoring Active
            </span>
          )}
        </div>
        <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center mt-4 overflow-hidden">
          {isCameraOn && !isMonitoringActive ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className='text-center'>
              <FiPlayCircle className="text-gray-600 text-5xl"/>
              <p className="text-gray-500 mt-2">
                {isMonitoringActive 
                  ? "Camera sedang digunakan untuk monitoring" 
                  : "Camera feed is off"}
              </p>
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
        disabled={isMonitoringActive}
      />
    </div>
  );
};

export default LivePreviewPanel;