import axiosInstance from "./axiosInstance";

export const shareWithUser = (fileId, targetEmail, permission) => {
    return axiosInstance.post("/share/user", { fileId, targetEmail, permission });
};

export const getSharedWithMe = () => {
    return axiosInstance.get("/share/with-me");
};

export const createShareLink = (fileId, permission, expiresInHours) => {
    return axiosInstance.post("/share/link", { fileId, permission, expiresInHours });
};

export const getSharesForFile = (fileId) => axiosInstance.get(`/share/file/${fileId}`);
export const removeShare = (shareId) => axiosInstance.delete(`/share/${shareId}`);

export const shareFolderWithUser = (folderId, targetEmail, permission) => {
    return axiosInstance.post("/share/folder", { folderId, targetEmail, permission });
};

export const getFoldersSharedWithMe = () => axiosInstance.get("/share/folders-with-me");
export const getSharesForFolder = (folderId) => axiosInstance.get(`/share/folder/${folderId}`);
export const removeFolderShare = (shareId) => axiosInstance.delete(`/share/folder/${shareId}`);