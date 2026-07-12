import api from "../baseApi.js";
import { locationService } from "./locationService.js";

export const pickUpService = {
    getPickUpDetail: async (groupId) => {
        const res = await api.get(`/pickup-groups/${groupId}`);
        return res.data;
    },

    getPickUpList: async (params = {}) => {
        const res = await api.get("/pickup-groups", { params });
        const pickups = res.data.items || [];

        const pickupWithLocation = await Promise.all(
            pickups.map(async(pickup) => {
                try {
                    const pickupInfo = await pickUpService.getPickUpDetail(pickup.id);
                    const locationInfo = await locationService.getLocationInfo(pickup.location_id);

                    return {
                        ...pickupInfo,
                        location: locationInfo,
                    };
                }
                catch (error) {
                    console.error(`沒有抓到 ${pickup.id} 的location info:`, error);
                    return {
                        ...pickup,
                        location: null,
                    };
                }
            })
        )
        return pickupWithLocation;
    },

    joinPickUpGroup: async (groupId) => {
        const res = await api.post(`/pickup-groups/${groupId}/orders`);
        return res.data;
    },

    getMyPickUpList: async () => {
        const res = await api.get("/pickup-orders");
        return res.data;
    }
}