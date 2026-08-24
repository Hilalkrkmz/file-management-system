import axiosInstance from "./axiosInstance";

export const getAllUsers = () => axiosInstance.get("/admin/users");
export const getAllFiles = () => axiosInstance.get("/admin/files");
export const adminDeleteFile = (id) => axiosInstance.delete(`/admin/files/${id}`);
export const adminDeleteFolder = (id) => axiosInstance.delete(`/admin/folders/${id}`);
export const updateUserQuota = (id, quotaMb) => axiosInstance.put(`/admin/users/${id}/quota`, { quotaMb });
export const updateUserRole = (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role });
export const adminDeleteUser = (id) => axiosInstance.delete(`/admin/users/${id}`);