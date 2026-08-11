import axiosInstance from "./axiosInstance";

export const getFolders = (parentId) => {
    const params = parentId ? { parentId } : {};
    return axiosInstance.get("/folders", { params });
};

export const createFolder = (name, parentFolderId) => {
    return axiosInstance.post("/folders", { name, parentFolderId });
};

export const deleteFolder = (id) => {
    return axiosInstance.delete(`/folders/${id}`);
};

export const getFolderTrash = () => axiosInstance.get("/folders/trash");

export const restoreFolder = (id) => axiosInstance.post(`/folders/${id}/restore`);