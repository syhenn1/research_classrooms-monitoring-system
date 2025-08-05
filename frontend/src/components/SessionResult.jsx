import React, { useEffect, useState } from "react";

export default function SessionResult() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/active-session"
        );
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        } else {
          console.error("Failed to fetch active session");
        }
      } catch (error) {
        console.error("Error fetching active session:", error);
      }
    };

    fetchSession();
  }, []);

  if (!session) {
    return (
      <div className="w-full p-4 rounded-2xl shadow-md bg-white">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Active Session
        </h2>
        <p className="text-gray-500">No active session found.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-2xl shadow-md bg-white">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Active Session
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Session Name</th>
              <th className="p-2 text-left">Lecturer</th>
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Room</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">{session.session_name}</td>
              <td className="p-2">{session.lecturer}</td>
              <td className="p-2">{session.subject}</td>
              <td className="p-2">{session.date}</td>
              <td className="p-2">{session.room}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
