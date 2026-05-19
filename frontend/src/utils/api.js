import axios from "axios";

// Auth APIs
export const signupAPI = (data) => axios.post("/auth/signup", data);
export const loginAPI = (data) => axios.post("/auth/login", data);
export const getMeAPI = () => axios.get("/auth/me");
export const getAllUsersAPI = () => axios.get("/auth/users");

// Project APIs
export const getProjectsAPI = () => axios.get("/projects");
export const getProjectByIdAPI = (id) => axios.get(`/projects/${id}`);
export const createProjectAPI = (data) => axios.post("/projects", data);
export const updateProjectAPI = (id, data) => axios.put(`/projects/${id}`, data);
export const deleteProjectAPI = (id) => axios.delete(`/projects/${id}`);
export const addMemberAPI = (projectId, userId) =>
  axios.post(`/projects/${projectId}/members`, { userId });
export const removeMemberAPI = (projectId, userId) =>
  axios.delete(`/projects/${projectId}/members/${userId}`);

// Task APIs
export const getTasksAPI = (params) => axios.get("/tasks", { params });
export const getTaskByIdAPI = (id) => axios.get(`/tasks/${id}`);
export const createTaskAPI = (data) => axios.post("/tasks", data);
export const updateTaskAPI = (id, data) => axios.put(`/tasks/${id}`, data);
export const deleteTaskAPI = (id) => axios.delete(`/tasks/${id}`);

// Dashboard API
export const getDashboardAPI = () => axios.get("/dashboard");
