import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import SetupPage from "./pages/SetupPage";
import HomePage from "./pages/HomePage";
import MonitoringPage from "./pages/MonitoringPage";
import ResultPage from "./pages/ResultPage";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/setup" />} />
      </Routes>
    </Router>
  );
}

export default App;