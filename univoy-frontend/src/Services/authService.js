import axios from "axios";

// allow the base API URL to be configured from an environment variable (needed
// when the frontend is served from a different host/port than the backend).
// REACT_APP_API_URL should include the "/api" segment if your server mounts
// routes there (e.g. https://...-5001.app.github.dev/api).
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
};

export const googleAuth = async (idToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google`, { idToken });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 