import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard";
import SideBar from "../components/SideBar";
import SessionResult from "../components/SessionResult";
import TimelineChart from "../components/TimelineChart";

const ResultPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/active-session"
        );
        const data = await response.json();

        if (!data.session) {
          navigate("/home");
        }
      } catch (error) {
        console.error("Failed to fetch active session:", error);
        navigate("/home");
      }
    };

    checkActiveSession();
  }, [navigate]);
  return (
    <div>
      <SideBar />
      <div className="p-16 gap-8 w-full flex flex-row h-screen md:flex-col">
        <div className="flex flex-col w-full gap-2">
          <h1 className="text-3xl font-bold mb-4">Monitoring Kelas</h1>
        </div>
        <SessionResult />
        <div className="flex flex-row w-full gap-2">
          <ResultCard
            title="Teori"
            value="50"
            unit="%"
            barColor="bg-green-500"
            classtype="theory"
          />
          <ResultCard
            title="Teori"
            value="50"
            unit="duration"
            barColor="bg-green-500"
            classtype="theory"
          />
          <ResultCard
            title="Quiz"
            value="50"
            unit="%"
            barColor="bg-red-500"
            classtype="quiz"
          />
          <ResultCard
            title="Quiz"
            value="50"
            unit="duration"
            barColor="bg-red-500"
            classtype="quiz"
          />
        </div>
        <TimelineChart />
      </div>
    </div>
  );
};

export default ResultPage;
