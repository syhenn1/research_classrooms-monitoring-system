import { FiPlay, FiCheck } from "react-icons/fi";

const SwitchQuiz = ({ switchmode, disabled }) => {
  return (
    <button
      onClick={switchmode}
      disabled={disabled}
      className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
        disabled 
          ? "bg-gray-600/30 text-gray-400 cursor-not-allowed border border-gray-600/30" 
          : "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
      }`}
    >
      {disabled ? (
        <>
          <FiCheck className="text-lg" />
          Quiz Started
        </>
      ) : (
        <>
          <FiPlay className="text-lg" />
          Start Quiz
        </>
      )}
    </button>
  );
};

export default SwitchQuiz;