import MonitorScreen from './components/MonitorScreen';
import Logs from './components/Logs';
import Screen from './components/Screen';

function App() {
return (
  
    <div>
      <Screen>
      <h1 className='text-3xl bg-blue-500'>Monitoring Kelas</h1>
        <MonitorScreen />
        <Logs />
      </Screen>
    </div>
  );
}

export default App;
