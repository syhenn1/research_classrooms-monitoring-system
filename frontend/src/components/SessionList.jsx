// src/components/SessionList.js

import React from 'react';
import SessionItem from './SessionItem';

export default function SessionList({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return <p className="text-gray-600">Belum ada sesi yang tercatat.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session) => (
        <SessionItem key={session.session_id} session={session} />
      ))}
    </div>
  );
}