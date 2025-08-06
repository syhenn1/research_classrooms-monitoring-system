import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import SummaryCard from '../components/SummaryCard';
import PieChart from '../components/PieChart';
import SideBar from '../components/SideBar';
import ConfirmationModal from '../components/ConfirmationModal';
import { FiCheckCircle } from 'react-icons/fi';

const ResultPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resultData, setResultData] = useState({
    sessionDetails: null,
    totalDisruption: 0,
    totalCheating: 0,
    theoryDuration: "0s",
    quizDuration: "0s",
    allLogs: [],
  });

  useEffect(() => {
    const fetchDataAndCalculate = async () => {
      try {
        const sessionResponse = await fetch("http://127.0.0.1:8000/api/active-session");
        const sessionData = await sessionResponse.json();
        if (!sessionData.session) {
          navigate('/home');
          return;
        }
        
        const logsResponse = await fetch("http://127.0.0.1:8000/api/logs");
        const allLogs = await logsResponse.json();
        
        const relevantLogs = allLogs.filter(log => log.session_id === sessionData.session.session_id);
        const theoryLogs = relevantLogs.filter(log => log.classtype === 'theory');
        const quizLogs = relevantLogs.filter(log => log.classtype === 'quiz');

        const formatDuration = (logs) => {
          if (logs.length < 2) return "0s";
          const times = logs.map(log => new Date(log.time)).sort((a, b) => a - b);
          const durationSeconds = Math.round((times[times.length - 1] - times[0]) / 1000);
          const hours = Math.floor(durationSeconds / 3600);
          const minutes = Math.floor((durationSeconds % 3600) / 60);
          const seconds = durationSeconds % 60;
          let str = '';
          if (hours > 0) str += `${hours}h `;
          if (minutes > 0) str += `${minutes}m `;
          str += `${seconds}s`;
          return str.trim() || "0s";
        };

        setResultData({
          sessionDetails: sessionData.session,
          totalDisruption: theoryLogs.length,
          totalCheating: quizLogs.length,
          theoryDuration: formatDuration(theoryLogs),
          quizDuration: formatDuration(quizLogs),
          allLogs: relevantLogs,
        });
      } catch (error) {
        console.error("Error processing result data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndCalculate();
  }, [navigate]);

  const handleExportExcel = () => {
    if (!resultData.sessionDetails) return;
    const dataToExport = [{
      'Tanggal & Waktu': `${resultData.sessionDetails.date} at ${resultData.sessionDetails.time}`,
      'Nama Event': resultData.sessionDetails.session_name,
      'Total Disruption': resultData.totalDisruption,
      'Total Cheating': resultData.totalCheating,
      'Durasi Teori': resultData.theoryDuration,
      'Durasi Kuis': resultData.quizDuration,
    }];
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Session Result");
    worksheet["!cols"] = [ { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } ];
    XLSX.writeFile(workbook, `result_${resultData.sessionDetails.session_name}.xlsx`);
  };

  const finishSession = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/session/end", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: resultData.sessionDetails.session_id,
            theoryTotal: resultData.totalDisruption,
            quizTotal: resultData.totalCheating
        })
      });
    } catch (error) {
      console.error("Failed to end session on backend:", error);
    } finally {
      sessionStorage.removeItem('sessionId');
      navigate('/home');
    }
  };

  const handleConfirmAndExport = () => {
    handleExportExcel();
    finishSession();
  };

  if (loading || !resultData.sessionDetails) {
    return (
      <div className="flex h-screen bg-dark-blue">
        <SideBar />
        <div className="flex-1 flex items-center justify-center text-white">
          {loading ? 'Loading results...' : 'No result data found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-blue">
      <SideBar />
      <div className="flex-1 p-8 overflow-y-auto text-white font-sans animate-fade-in">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Monitoring Result</h1>
          <p className="text-gray-400 mt-2">Summary for: {resultData.sessionDetails.session_name}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SummaryCard 
              sessionDetails={resultData.sessionDetails}
              totalDisruption={resultData.totalDisruption}
              theoryDuration={resultData.theoryDuration}
              totalCheating={resultData.totalCheating}
              quizDuration={resultData.quizDuration}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PieChart 
              disruptionCount={resultData.totalDisruption}
              cheatingCount={resultData.totalCheating}
            />
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all">
                <FiCheckCircle/>
                Finish Session
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAndExport}
        onDeny={finishSession}
      />
    </div>
  );
};

export default ResultPage;