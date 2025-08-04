const EndMonitoring = ({ onEnd }) => {
  return (
    <button
      onClick={onEnd}
      className="w-full bg-[#113F67] text-white font-semibold py-3 px-4 rounded-xl shadow"
    >
      End Monitoring
    </button>
  );
};

export default EndMonitoring;
