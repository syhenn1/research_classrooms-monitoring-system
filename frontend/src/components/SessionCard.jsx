import React, { useState, useEffect, useMemo } from "react";
import { FiChevronDown, FiChevronUp, FiCalendar, FiClock, FiZap, FiBarChart2, FiActivity, FiList } from "react-icons/fi";
import { Bar, Scatter } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale } from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, TimeScale);

const LogList = ({ title, logs, colorClass }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`font-semibold ${colorClass}`}>{title}</h4>
        <span className={`text-xs font-medium ${colorClass.replace('text-', 'bg-').replace('400', '500/20')} px-2 py-1 rounded-full`}>
          {logs.length} Events
        </span>
      </div>
      <ul className="space-y-2 text-xs text-gray-400 max-h-40 overflow-y-auto pr-2">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <li key={index} className="flex items-center justify-between p-2 rounded-md bg-white/5">
              <div><span className="font-bold text-white">{log.label}</span><span className="text-white/70"> ({log.confidence}%)</span></div>
              <span className="text-white/70 font-mono">{new Date(log.time).toLocaleTimeString()}</span>
            </li>
          ))
        ) : (<li className="italic text-gray-500">No events recorded.</li>)}
      </ul>
    </div>
);

const SessionCard = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [totalLogs, setTotalLogs] = useState(0);
  const [detailedLogs, setDetailedLogs] = useState([]);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogCount = async () => {
      setIsCountLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/logs/${session.session_id}`);
        if (!res.ok) throw new Error("Count failed");
        const data = await res.json();
        setTotalLogs(data.length);
      } catch (err) { console.error("Gagal ambil jumlah log:", err); setTotalLogs(0); }
      finally { setIsCountLoading(false); }
    };
    fetchLogCount();
  }, [session.session_id]);

  const fetchDetails = async () => {
    if (detailedLogs.length > 0) return;
    setIsDetailsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/logs/${session.session_id}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setDetailedLogs(data);
    } catch (err) { setError(err.message); console.error("Gagal ambil detail log:", err); }
    finally { setIsDetailsLoading(false); }
  };

  const handleToggle = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && detailedLogs.length === 0) {
      fetchDetails();
    }
  };

  const { theoryLogs, quizLogs, barChartData, scatterChartData, confidenceChartData } = useMemo(() => {
    const theory = detailedLogs.filter(log => log.classtype === "theory");
    const quiz = detailedLogs.filter(log => log.classtype === "quiz");
    const labels = [...new Set(detailedLogs.map(log => log.label))].sort();

    const confidenceAverages = labels.map(label => {
        const logsForLabel = detailedLogs.filter(log => log.label === label);
        const totalConfidence = logsForLabel.reduce((acc, log) => acc + log.confidence, 0);
        return logsForLabel.length > 0 ? (totalConfidence / logsForLabel.length).toFixed(2) : 0;
    });

    return {
      theoryLogs: theory,
      quizLogs: quiz,
      barChartData: {
          labels,
          datasets: [
            { label: "Theory Phase", data: labels.map(l => theory.filter(log => log.label === l).length), backgroundColor: "#6366f1" },
            { label: "Quiz Phase", data: labels.map(l => quiz.filter(log => log.label === l).length), backgroundColor: "#ef4444" },
          ],
      },
      scatterChartData: {
          datasets: labels.map(label => {
              const colorMap = { 'bend': 'rgba(59, 130, 246, 0.7)', 'sleep': 'rgba(239, 68, 68, 0.7)', 'phone': 'rgba(249, 115, 22, 0.7)', 'look around': 'rgba(16, 185, 129, 0.7)' };
              return {
                  label: label,
                  data: detailedLogs.filter(log => log.label === label).map(log => ({ x: new Date(log.time), y: log.confidence })),
                  backgroundColor: colorMap[label] || 'rgba(168, 85, 247, 0.7)',
              }
          })
      },
      confidenceChartData: {
          labels,
          datasets: [{
              label: 'Average Confidence',
              data: confidenceAverages,
              backgroundColor: '#10b981',
              borderColor: '#34d399',
              borderWidth: 1,
          }],
      }
    };
  }, [detailedLogs]);
  
  const commonChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: '#d1d5db', boxWidth: 12, padding: 15 }}}};
  const barChartOptions = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: 'Event Frequency', color: '#f9fafb' } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af', beginAtZero: true } } } };
  const scatterChartOptions = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { display: true, text: 'Event Timeline & Confidence', color: '#f9fafb' } }, scales: { x: { type: 'time', time: { unit: 'minute', displayFormats: { minute: 'HH:mm' } }, ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'Confidence (%)', color: '#9ca3af'} } } };
  const confidenceChartOptions = { ...commonChartOptions, indexAxis: 'y', plugins: { ...commonChartOptions.plugins, title: { display: true, text: 'Average Confidence', color: '#f9fafb' } }, scales: { x: { ticks: { color: '#9ca3af' }, min: 0, max: 100 }, y: { ticks: { color: '#9ca3af' } } } };

  const TabButton = ({ tabName, icon, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white truncate">{session.session_name}</h3>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
            <span className="flex items-center gap-1.5"><FiCalendar /> {session.date}</span>
            <span className="flex items-center gap-1.5"><FiClock /> {session.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-300 text-center">
          <FiZap size={16} />
          <span className="font-bold text-lg w-8">{isCountLoading ? '...' : totalLogs}</span>
          <span className="text-sm text-gray-400">Logs</span>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-white/10 animate-fade-in">
          {isDetailsLoading && <p className="text-sm text-center text-gray-400 py-8">Loading details...</p>}
          {error && <p className="text-sm text-center text-red-400 py-8">Error: {error}</p>}
          
          {!isDetailsLoading && !error && detailedLogs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 bg-black/20 p-1 rounded-lg">
                <TabButton tabName="overview" icon={<FiBarChart2 />} label="Overview" />
                <TabButton tabName="timeline" icon={<FiActivity />} label="Timeline" />
                <TabButton tabName="logs" icon={<FiList />} label="Logs" />
              </div>
              
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
                  <div className="bg-white/5 p-2 rounded-lg h-64"><Bar options={barChartOptions} data={barChartData} /></div>
                  <div className="bg-white/5 p-2 rounded-lg h-64"><Bar options={confidenceChartOptions} data={confidenceChartData} /></div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="bg-white/5 p-2 rounded-lg h-80 animate-fade-in">
                  <Scatter options={scatterChartOptions} data={scatterChartData} />
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <LogList title="Theory Phase Logs" logs={theoryLogs} colorClass="text-indigo-400" />
                    <LogList title="Quiz Phase Logs" logs={quizLogs} colorClass="text-red-400" />
                </div>
              )}
            </div>
          )}

          {!isDetailsLoading && !error && totalLogs === 0 && (
             <p className="text-sm text-center text-gray-500 italic py-8">No activity was recorded in this session.</p>
          )}
        </div>
      )}

      <div className="border-t border-white/10">
        <button onClick={handleToggle} className="w-full flex justify-center items-center gap-2 p-2 text-xs font-semibold text-gray-400 hover:bg-white/10">
          {isOpen ? "Hide Details" : "Show Details"}
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
    </div>
  );
};

export default SessionCard;