// axiosInstance.ts
import axios from "axios";

const baseURL = "https://dicenca.jodomodev.com/api";

// const baseURL = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true, // 5 segundos de espera antes de cancelar la solicitud
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // withCredentials: true,
  },
});

export default axiosInstance;
