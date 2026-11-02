import axiosClient from "./axiosClient";

/**
 * Fetch paginated list of notifications
 */
export const getNotifications = async ({ page = 1, limit = 20, isRead } = {}) => {
  const params = { page, limit };
  if (typeof isRead === "boolean") {
    params.isRead = isRead;
  }
  const res = await axiosClient.get("/notifications", { params });
  return res?.data?.data || res?.data || res || { notifications: [], pagination: {} };
};

/**
 * Fetch unread notification count (Redis-cached in backend)
 */
export const getUnreadNotificationCount = async () => {
  const res = await axiosClient.get("/notifications/unread-count");
  const data = res?.data?.data || res?.data || res;
  return typeof data?.unreadCount === "number" ? data.unreadCount : 0;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id) => {
  const res = await axiosClient.patch(`/notifications/${id}/read`);
  return res?.data?.data || res?.data || res;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  const res = await axiosClient.patch("/notifications/read-all");
  return res?.data?.data || res?.data || res;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id) => {
  const res = await axiosClient.delete(`/notifications/${id}`);
  return res?.data?.data || res?.data || res;
};
