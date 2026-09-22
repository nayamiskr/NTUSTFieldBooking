import api from "../baseApi.js";

export const getUserProfile = async () => {
    const res = await api.get("/me");
    return res.data.user;
}

export const updateUserProfile = async (profile) => {
    const res = await api.patch("/me", profile);
    return res.data;
}
