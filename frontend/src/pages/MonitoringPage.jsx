import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MonitorScreen from "../components/MonitorScreen";
import Logs from "../components/Logs";
import SideBar from "../components/SideBar";
import Counter from "../components/Counter";
import EndMonitoring from "../components/EndMonitoring";
import SwitchQuiz from "../components/SwitchQuiz";

const MonitoringPage = () => {
  const [mode, setMode] = useState("theory");
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();

  const switchToQuiz = () => {
    setMode("quiz");
    setQuizStarted(true); // Tombol SwitchQuiz disable permanen setelah ini
  };

  const handleEndMonitoring = () => {
    navigate("/result"); // Pindah ke halaman result
  };

  return (
    <div>
      <div className="p-16 gap-8 w-full flex flex-col h-screen md:flex-row">
        <div className="flex flex-col w-full gap-2">
          <h1 className="text-3xl font-bold mb-4">Monitoring Kelas</h1>
          <MonitorScreen type={mode} />
          <Counter />
        </div>
        <div className="flex flex-col w-full md:w-1/3 gap-2 h-full">
          <h1 className="text-3xl mb-4">Activity Log</h1>
          <div className="flex-1 overflow-y-auto rounded-xl">
            <Logs />
          </div>
          <SwitchQuiz switchmode={switchToQuiz} disabled={quizStarted} />
          <EndMonitoring onEnd={handleEndMonitoring} />
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
