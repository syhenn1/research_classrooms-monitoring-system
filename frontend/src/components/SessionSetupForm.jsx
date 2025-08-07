import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const SessionSetupForm = ({ time, date, onSessionAdded }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    session_name: "",
  });

  const [activeSession, setActiveSession] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      session_name: form.session_name,
      time: time,
      date: date,
    };

    const response = await fetch("http://localhost:8000/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      alert(`Session Created! ID: ${data.session_id}`);

      // AUTO SET SESSION AKTIF
      await fetch(`http://localhost:8000/api/set-session/${data.session_id}`, {
        method: "POST",
      });
      

      if (onSessionAdded) onSessionAdded();

      // GET ACTIVE SESSION DATA
      const activeResponse = await fetch(
        "http://127.0.0.1:8000/api/active-session"
      );
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setActiveSession(activeData.session);
        navigate("/monitoring");
      }
    } else {
      alert("Failed to create session.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl space-y-6 border border-white/10"
    >
      <div>
        <label className="text-sm font-medium text-gray-400">Time & Date</label>
        {activeSession ? (
          <p className="text-lg font-semibold">{`${activeSession.time} | ${activeSession.date}`}</p>
        ) : (
          <p className="text-lg font-semibold">{`${time} | ${date}`}</p>
        )}
      </div>

      <div className="relative">
        <label
          htmlFor="event-name"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Event Name
        </label>
        <FiFileText className="absolute left-3 top-10 text-gray-400" />
        <input
          type="text"
          id="event-name"
          name="session_name"
          value={
            activeSession
              ? `${activeSession.session_name} | ${activeSession.date} | ${activeSession.time}`
              : form.session_name
          }
          onChange={handleChange}
          placeholder="Example: Final Exam - Mathematics"
          className="w-full pl-10 pr-4 py-2 bg-dark-blue border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          readOnly={activeSession !== null}
        />
      </div>

      <div className="pt-6">
        <p className="text-sm text-gray-400">
          Pastikan nama event jelas dan deskriptif. Pengaturan lain dapat
          diakses setelah monitoring dimulai.
        </p>
      </div>

      {!activeSession && (
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Create Session & Start Monitoring
        </button>
      )}

      {activeSession && (
        <div className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg text-center">
          Active Session: {activeSession.session_name}
        </div>
      )}
    </form>
  );
};

export default SessionSetupForm;
