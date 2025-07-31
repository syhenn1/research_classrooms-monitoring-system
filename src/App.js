import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SetupPage from "./pages/SetupPage";
import MonitoringPage from "./pages/MonitoringPage";
import ResultPage from "./pages/ResultPage";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/setup" />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
