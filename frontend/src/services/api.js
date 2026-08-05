import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for better error messages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.userMessage =
        "Backend server is offline. Please start the FastAPI server.";
    } else if (error.response.status === 404) {
      error.userMessage = "API endpoint not found.";
    } else if (error.response.status === 500) {
      error.userMessage =
        error.response.data?.detail || "Internal server error. Check backend logs.";
    } else if (error.response.status === 422) {
      error.userMessage = "Invalid data sent to server. Check form inputs.";
    }
    return Promise.reject(error);
  }
);

// ─── Students ────────────────────────────────────────────────────────────────

export const registerStudent = async (formData) => {
  const response = await API.post("/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getStudents = async () => {
  const response = await API.get("/students");
  return response.data;
};

export const getStudent = async (uid) => {
  const response = await API.get(`/students/${uid}`);
  return response.data;
};

export const updateStudent = async (uid, formData) => {
  const response = await API.put(`/students/${uid}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteStudent = async (uid) => {
  const response = await API.delete(`/students/${uid}`);
  return response.data;
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const markAttendance = async (formData) => {
  const response = await API.post("/attendance", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAttendanceRecords = async (course = "", date = "") => {
  const response = await API.get("/attendance", { params: { course, date } });
  return response.data;
};

export const getAttendanceHistory = async (filters = {}) => {
  const response = await API.get("/history", { params: filters });
  return response.data;
};

export const deleteAttendanceRecord = async (uid, date, time) => {
  const response = await API.delete("/attendance", {
    params: { uid, date, time },
  });
  return response.data;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const response = await API.get("/dashboard");
  return response.data;
};



// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
  return response.data;
};

export default API;
