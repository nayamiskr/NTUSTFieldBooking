import api from "../baseApi.js";

export const getUserProfile = async () => {
    const res = await api.get("/me");
    return res.data.user;
}