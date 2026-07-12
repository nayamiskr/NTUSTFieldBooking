import api from "../baseApi.js";

export const locationService = {
    getLocationInfo: async (locationId) => {
        const res = await api.get(`/locations/${locationId}`);
        return res.data;
    }
}