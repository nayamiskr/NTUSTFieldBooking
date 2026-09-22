import api from "../baseApi.js";

export const sportService = {
    // 取得運動種類清單
    getSportList: async () => {
        const res = await api.get("/sports");
        return res.data;
    },

    getSportById: async (sportId) => {
        const res = await api.get(`/sports/${sportId}`);
        return res.data;
    }
}