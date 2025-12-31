import axios from "axios";

const API_URL = "http://localhost:5001/api";

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