import { FiSquare } from "react-icons/fi";

const EndMonitoring = ({ onEnd }) => {
  return (
    <button
      onClick={onEnd}
      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-red-500 hover:shadow-lg hover:shadow-red-500/25"
    >
      <FiSquare className="text-lg" />
      End Monitoring
    </button>
  );
};

export default EndMonitoring;