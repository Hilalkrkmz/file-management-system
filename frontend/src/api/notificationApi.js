import axiosInstance from "./axiosInstance";

export const getNotifications = () => axiosInstance.get("/notifications");

export const getUnreadNotificationCount = () => axiosInstance.get("/notifications/unread-count");

export const markAllNotificationsRead = () => axiosInstance.post("/notifications/read-all");
