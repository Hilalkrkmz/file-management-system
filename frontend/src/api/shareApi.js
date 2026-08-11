import axiosInstance from "./axiosInstance";

export const shareWithUser = (fileId, targetUsername, permission) => {
    return axiosInstance.post("/share/user", { fileId, targetUsername, permission });
};

export const getSharedWithMe = () => {
    return axiosInstance.get("/share/with-me");
};

export const createShareLink = (fileId, permission, expiresInHours) => {
    return axiosInstance.post("/share/link", { fileId, permission, expiresInHours });
};