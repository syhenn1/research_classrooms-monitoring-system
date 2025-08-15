// src/components/SessionItem.js

import React from 'react';

export default function SessionItem({ session }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 px-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-700">
          {session.session_name}
        </h3>
        <span className="text-sm text-gray-500">
          {session.date} at {session.time}
        </span>
      </div>
      <div className="flex gap-8">
        <div>
          <span className="text-xs text-gray-400 uppercase font-medium tracking-wider">
            Disruption Total
          </span>
          <p className="text-2xl font-bold text-gray-800">
            {session.disruptionTotal}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase font-medium tracking-wider">
            Cheating Total
          </span>
          <p className="text-2xl font-bold text-gray-800">
            {session.cheatingTotal}
          </p>
        </div>
      </div>
    </div>
  );
}