import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api-field.gravitycat.tw/v1";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  const url = config.url || "";
  const isAuthRoute = url.includes("/auth");

  if (token && !isAuthRoute) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;