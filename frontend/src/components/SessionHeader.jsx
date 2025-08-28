import React from 'react';

const SessionHeader = ({ children }) => (
  <header className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-bold">Session Configuration</h1>
      <p className="text-gray-300">Please set up the details for the monitoring session.</p>
    </div>
    <div>
      {children}
    </div>
  </header>
);

export default SessionHeader;