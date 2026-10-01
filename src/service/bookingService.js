import api from "../baseApi.js";

export const bookingService = {
    getBookingList: async (params = {}, withResourceType = false) => {
        const res = await api.get("/bookings", { params });
        if (!withResourceType) return res.data;

        const items = res.data.items || [];
        const resourceIds = [...new Set(items
            .filter((order) => !order.resource?.resource_type)
            .map((order) => order.resource?.id || order.resource_id)
            .filter(Boolean))];
        const resourceEntries = await Promise.all(resourceIds.map(async (id) => {
            try {
                const resource = await api.get(`/resources/${id}`);
                return [id, resource.data];
            } catch {
                return [id, null];
            }
        }));
        const resourcesById = new Map(resourceEntries);

        return {
            ...res.data,
            items: items.map((order) => {
                const resourceId = order.resource?.id || order.resource_id;
                const resourceType = order.resource?.resource_type || resourcesById.get(resourceId)?.resource_type;
                if (!resourceType) return order;

                return {
                    ...order,
                    resource: { ...order.resource, resource_type: resourceType },
                };
            }),
        };
    },
}
