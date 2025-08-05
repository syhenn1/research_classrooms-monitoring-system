const SwitchQuiz = ({ switchmode, disabled }) => {
  return (
    <button
      onClick={switchmode}
      disabled={disabled}
      className={`w-full font-semibold py-3 px-4 rounded-xl shadow ${
        disabled ? "bg-[#EEEEEE] text-[#767676]" : "bg-[#113F67] text-white"
      }`}
    >
      {disabled ? "Quiz Dimulai" : "Mulai Quiz"}
    </button>
  );
};

export default SwitchQuiz;
