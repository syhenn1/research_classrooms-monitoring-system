import React from 'react';
import { FiFileText } from 'react-icons/fi';

const SessionSetupForm = ({ time, date }) => (
  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl space-y-6 border border-white/10">
    <div>
      <label className="text-sm font-medium text-gray-400">Time & Date</label>
      <p className="text-lg font-semibold">{`${time} | ${date}`}</p>
    </div>

    <div className="relative">
      <label htmlFor="event-name" className="block text-sm font-medium text-gray-300 mb-1">
        Event Name
      </label>
      <FiFileText className="absolute left-3 top-10 text-gray-400" />
      <input
        type="text"
        id="event-name"
        placeholder="Example: Final Exam - Mathematics"
        className="w-full pl-10 pr-4 py-2 bg-dark-blue border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
    
    <div className="pt-6">
        <p className="text-sm text-gray-400">
            Pastikan nama event jelas dan deskriptif. Pengaturan lain dapat diakses setelah monitoring dimulai.
        </p>
    </div>
  </div>
);

export default SessionSetupForm;