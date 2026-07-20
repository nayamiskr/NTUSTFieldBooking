import axios from "axios";
import { useAuthStore } from "./store/authStore";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api-field.gravitycat.tw/v1";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

//在實作上加入攔截器，每當執行的api不是auth的時候，才會把token放入header中
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const isAuth = config.url?.includes("auth");


  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  //如果回傳的代碼是401且不是處理login的話，將處理錯誤
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config.url;

      if (!url.includes("auth")) {
        useAuthStore.getState().setLogout();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
