import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import RegisterStudent from "./pages/RegisterStudent";
import MarkAttendance from "./pages/MarkAttendance";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarkAttendance />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterStudent />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;