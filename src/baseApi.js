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

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 檢查錯誤狀態碼是否為 401 
    if (error.response && error.response.status === 401) {
      alert("登入逾時或尚未登入，請重新登入");
      
      // 清除本地過期的 token 
      localStorage.removeItem('token'); 
      
      // 強制跳轉到登入頁面
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

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