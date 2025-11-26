// axiosInstance.ts
import axios from "axios";

// const baseURL = "https://dicenca.jodomodev.com/api";

const baseURL = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
