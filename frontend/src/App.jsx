import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Dashboard from "./pages/Dashboard";
import RegisterStudent from "./pages/RegisterStudent";
import MarkAttendance from "./pages/MarkAttendance";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#1e293b" },
          },
          error: {
            iconTheme: { primary: "#f43f5e", secondary: "#1e293b" },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<MarkAttendance />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterStudent />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;