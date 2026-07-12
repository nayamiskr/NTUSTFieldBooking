import api from "../baseApi.js";

export const bookingService = {
    getBookingList: async (params = {}) => {
        const res = await api.get("/bookings", { params });
        return res.data;
    },
}