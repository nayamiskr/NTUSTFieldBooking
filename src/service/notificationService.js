import api from "../baseApi";

export const notificationService = {
  async getList({ unreadOnly = false, page = 1, pageSize = 10, signal } = {}) {
    const { data } = await api.get("/notifications", {
      params: { unread_only: unreadOnly, page, page_size: pageSize }, signal,
    });
    if (!Array.isArray(data.items) || !Number.isInteger(data.total) || data.total < 0) {
      throw new Error("通知列表回應格式不正確");
    }
    return { items: data.items, total: data.total,
      page: data.page > 0 ? data.page : page,
      pageSize: data.page_size > 0 ? data.page_size : pageSize };
  },
  async getUnreadCount({ signal } = {}) {
    const { data } = await api.get("/notifications/unread-count", { signal });
    const count = data.unread;
    if (!Number.isInteger(count) || count < 0) throw new Error("未讀數回應格式不正確");
    return count;
  },
  async markRead(id) {
    await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },
  async markAllRead() {
    const { data } = await api.post("/notifications/read-all");
    return data.updated;
  },
};
