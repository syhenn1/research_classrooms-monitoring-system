const Screen = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      gap: '20px',
      padding: '20px'
    }}>
      {children}
    </div>
  );
};

export default Screen;
