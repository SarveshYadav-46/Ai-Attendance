import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const registerStudent = async (formData) => {
  const response = await API.post("/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const markAttendance = async (formData) => {
  const response = await API.post("/attendance", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get("/dashboard");
  return response.data;
};

export const getAttendanceRecords = async (course = "", date = "") => {
  const response = await API.get("/attendance", {
    params: { course, date },
  });
  return response.data;
};

export const getAttendanceHistory = async (filters = {}) => {
  const response = await API.get("/history", {
    params: filters,
  });
  return response.data;
};

export const getStudents = async () => {
  const response = await API.get("/students");
  return response.data;
};

export const deleteStudent = async (uid) => {
  const response = await API.delete(`/students/${uid}`);
  return response.data;
};
