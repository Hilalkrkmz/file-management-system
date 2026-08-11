import axiosInstance from "./axiosInstance";

export const getFiles = (folderId) => {
    return axiosInstance.get("/files", { params: { folderId } });
};

export const uploadFile = (folderId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post("/files", formData, {
        params: { folderId },
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const downloadFile = (id, filename) => {
    return axiosInstance.get(`/files/${id}/download`, { responseType: "blob" }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
};

export const deleteFile = (id) => {
    return axiosInstance.delete(`/files/${id}`);
};

export const getFileTrash = () => axiosInstance.get("/files/trash");

export const restoreFile = (id) => axiosInstance.post(`/files/${id}/restore`);

export const searchFiles = (query) => axiosInstance.get("/files/search", { params: { query } });