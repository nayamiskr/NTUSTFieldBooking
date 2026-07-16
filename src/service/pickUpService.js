import api from "../baseApi.js";
import { locationService } from "./locationService.js";

export const pickUpService = {
  getPickUpDetail: async (groupId) => {
    const res = await api.get(`/pickup-groups/${groupId}`);
    return res.data;
  },

  getPickUpList: async (params = {}) => {
    const [res, myOrders] = await Promise.all([
      api.get("/pickup-groups", { params }),
      pickUpService.getMyPickUpList().catch(() => []),
    ]);

    const pickups = res.data.items || [];

    // 建立一個映射，將我的訂單的 pickup_group_id 對應到其狀態
    const enrolledStatusMap = myOrders.reduce((acc, order) => {
      acc[order.pickup_group_id] = order.status;
      return acc;
    }, {});

    // 對每個 pickup group 進行處理，加入 location info 和設施資訊
    const pickupWithLocation = await Promise.all(
      pickups.map(async (pickup) => {
        const orderStatus = enrolledStatusMap[pickup.id];

        try {
          const pickupInfo = await pickUpService.getPickUpDetail(pickup.id);
          const locationInfo = await locationService.getLocationInfo(
            pickup.location_id,
          );
          const facilities = locationInfo?.facility.split("_") || [];
          console.log(`抓到 ${pickup.id} 的location info:`, facilities);

          return {
            ...pickupInfo,
            location: locationInfo,
            facilities: facilities,
            enrolledStatus: orderStatus || null,
          };
        } catch (error) {
          console.error(`沒有抓到 ${pickup.id} 的location info:`, error);
          return {
            ...pickup,
            location: null,
            enrolledStatus: orderStatus || null,
          };
        }
      }),
    );
    return pickupWithLocation;
  },

  joinPickUpGroup: async (groupId) => {
    const res = await api.post(`/pickup-groups/${groupId}/orders`);
    return res.data;
  },

  getMyPickUpList: async () => {
    const res = await api.get("/pickup-orders");
    return res.data;
  },
};
