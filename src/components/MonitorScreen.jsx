const MonitorScreen = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <img
        src="http://localhost:8000/video_feed"
        alt="Video Stream"
        style={{ border: '2px solid black', width: '640px' }}
      />
    </div>
  );
};

export default MonitorScreen;
