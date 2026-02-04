import axios from "axios";
import { Config } from "./config";

const api = axios.create({
  baseURL: Config.base_url,
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const request = async (endpoint, method = 'GET', data = null) => {
  try {
    const response = await api({
      url: endpoint,
      method,
      data,
    });
    // The axios instance automatically returns the response data
    return response.data;
  } catch (error) {
    // Log a more detailed error to the console for easier debugging
    console.error(`API request to ${endpoint} failed:`, error.response || error);
    throw error;
  }
};
