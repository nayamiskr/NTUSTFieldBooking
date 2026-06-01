import api from "../baseApi.js";

export const pickUpService = {
    getPickUpList: async (params = {}) => {
        const res = await api.get("/pickup-groups", { params });
        return res.data;
    },
    joinPickUpGroup: async (groupId) => {
        const res = await api.post(`/pickup-groups/${groupId}/orders`);
        return res.data;
    }
}

export const addGroup = async (groupId) => {
    try {
        return await pickUpService.joinPickUpGroup(groupId);
    } catch (error) {
        console.error("Error joining group:", error);
        throw error;
    }
};
