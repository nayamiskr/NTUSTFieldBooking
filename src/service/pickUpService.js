import api from "../baseApi.js";

export const pickUpService = {
    getPickUpList: async (params = {}) => {
        const res = await api.get("/pickup-groups", { params });
        return res.data;
    }
}