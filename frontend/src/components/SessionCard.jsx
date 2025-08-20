import React, { useState } from "react";
import LogsDetail from "./LogsDetail";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function SessionCard({ session }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/10 border border-gray-700 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg">
      <div
        className="flex justify-between items-center p-5 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h3 className="text-xl font-semibold">{session.session_name}</h3>
          <span className="text-sm text-gray-400">
            {session.date} at {session.time}
          </span>
        </div>
        {open ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
      </div>

      {open && (
        <div className="p-5 border-t border-gray-700 animate-fade-in">
          <LogsDetail sessionId={session.session_id} />
        </div>
      )}
    </div>
  );
}
