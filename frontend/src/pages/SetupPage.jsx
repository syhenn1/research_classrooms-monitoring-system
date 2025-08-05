import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiShield,
  FiEye,
  FiBarChart2,
} from 'react-icons/fi';

const SetupPage = () => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState({ camera: 'checking', permission: 'checking' });
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });

        if (permissionStatus.state === 'denied') {
          setPermissionDenied(true);
          setChecks({ camera: 'failed', permission: 'failed' });
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setChecks(prev => ({ ...prev, permission: 'success' }));

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoInputDevices.length > 0) {
          setChecks(prev => ({ ...prev, camera: 'success' }));
        } else {
          setChecks(prev => ({ ...prev, camera: 'failed' }));
        }

        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setChecks({ camera: 'failed', permission: 'failed' });
      }
    };

    setTimeout(checkSystem, 500);
  }, []);

  const allChecksPassed = checks.camera === 'success' && checks.permission === 'success';

  const renderStatusIcon = status => {
    switch (status) {
      case 'checking':
        return <FiLoader className="animate-spin text-yellow-400" />;
      case 'success':
        return <FiCheckCircle className="text-green-400" />;
      case 'failed':
        return <FiXCircle className="text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue text-white p-6 sm:p-10 lg:p-16 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl animate-fade-in space-y-12">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Classroom Monitoring System</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Selamat datang! Sistem ini dirancang untuk membantu memastikan integritas selama sesi ujian. Silakan ikuti langkah-langkah di bawah ini.
          </p>
        </header>

        {/* Main */}
        <main className="space-y-12">
          {/* System Check First */}
          <div className="bg-white/5 p-8 rounded-xl space-y-6">
            <h2 className="text-2xl font-semibold">System Check</h2>

            {permissionDenied && (
              <div className="bg-red-500/10 border border-red-500 text-red-300 text-sm p-4 rounded-lg">
                <p className="font-semibold">Izin Kamera Diblokir</p>
                <p>
                  Anda telah menolak izin kamera. Harap aktifkan secara manual di pengaturan browser Anda (biasanya ikon gembok 🔒 di sebelah URL) lalu muat ulang halaman ini.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-md">
                <span className="flex items-center gap-2 text-base">
                  <FiEye className="text-indigo-300" />
                  Kamera
                </span>
                {renderStatusIcon(checks.camera)}
              </div>

              <div className="flex items-center justify-between bg-white/10 p-3 rounded-md">
                <span className="flex items-center gap-2 text-base">
                  <FiShield className="text-indigo-300" />
                  Izin Browser
                </span>
                {renderStatusIcon(checks.permission)}
              </div>
            </div>

            <button
              onClick={() => navigate('/home')}
              disabled={!allChecksPassed}
              className={`w-full mt-4 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
                allChecksPassed
                  ? 'bg-white text-dark-blue hover:scale-105'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              Start Monitoring
            </button>
          </div>

          {/* Feature Info Second */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: <FiEye />, label: 'Disruption' },
              { icon: <FiShield />, label: 'Cheating' },
              { icon: <FiBarChart2 />, label: 'Instant Reporting' },
            ].map(({ icon, label }, i) => (
              <div key={i} className="bg-white/10 p-5 rounded-xl transition hover:bg-white/20">
                <div className="text-indigo-300 text-3xl mb-2">{icon}</div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SetupPage;
