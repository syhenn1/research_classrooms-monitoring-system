import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ disruptionCount, cheatingCount }) => {
  const data = {
    labels: ['Disruption', 'Cheating'],
    datasets: [
      {
        data: [disruptionCount, cheatingCount],
        backgroundColor: ['#6366F1', '#EF4444'], // Indigo & Red solid
        borderColor: '#113F67', // Warna background untuk border
        borderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Sembunyikan legenda default
      title: { display: true, text: 'Event Distribution', color: '#ffffff' },
    },
  };

  return (
    <div className="w-full h-full p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Distribution</h2>
        <div className="max-w-[250px] mx-auto">
          <Pie data={data} options={options} />
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
            <span className="text-gray-300">Disruption Events</span>
          </div>
          <span className="font-bold">{disruptionCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-300">Cheating Events</span>
          </div>
          <span className="font-bold">{cheatingCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PieChart;