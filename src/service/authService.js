import api from "../baseApi.js";
import { useAuthStore } from "../store/authStore.js";

export const loginService = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });

  if (!res.data?.access_token) {
    throw new Error("Invalid credentials");
  }

  useAuthStore.getState().setAuth(res.data);

  return res.data;
};
