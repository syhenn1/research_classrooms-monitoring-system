import MonitorScreen from './components/MonitorScreen';
import Logs from './components/Logs';
import Screen from './components/Screen';

function App() {
return (
    <div>
      <h1>Monitoring Kelas</h1>
      <Screen>
        <MonitorScreen />
        <Logs />
      </Screen>
    </div>
  );
}

export default App;
