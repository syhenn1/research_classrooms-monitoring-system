import { useNavigate } from "react-router-dom";

const SetupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Setup Monitoring</h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate("/monitoring")}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
        >
          Go to Monitoring
        </button>

        <button
          onClick={() => navigate("/result")}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
        >
          Go to Result
        </button>
      </div>
    </div>
  );
};

export default SetupPage;
