import api from "../baseApi.js";
import { locationService } from "./locationService.js";

export const pickUpService = {
  // 取得臨打團細節
  getPickUpDetail: async (groupId) => {
    const res = await api.get(`/pickup-groups/${groupId}`);
    return res.data;
  },

  // 取得臨打團清單
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

  // 報名臨打團
  joinPickUpGroup: async (groupId) => {
    const res = await api.post(`/pickup-groups/${groupId}/orders`);
    return res.data;
  },

  // 取得我的臨打團預約清單
  getMyPickUpList: async (withDetail = false) => {
    const res = await api.get("/pickup-orders");
    const order = res.data;

    if (!withDetail) return order;

    const orderWithDetial = await Promise.all(
      order.map(async (order) => {
        const pickUpdetail = await pickUpService.getPickUpDetail(
          order.pickup_group_id,
        );
        const locationInfo = await locationService.getLocationInfo(
          pickUpdetail.location_id,
        );
        return {
          ...order,
          location: locationInfo,
          title: pickUpdetail.title,
          start_time: pickUpdetail.start_time,
          end_time: pickUpdetail.end_time,
        };
      }),
    );
    return orderWithDetial;
  },

  cancelPickUpOrder: async (orderId) => {
    const res = await api.patch(`/pickup-orders/${orderId}`, { status: "cancel_request" });
    return res.data;
  },
};
