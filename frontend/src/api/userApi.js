import axiosInstance from "./axiosInstance";

export const getMyProfile = () => axiosInstance.get("/users/me");

export const uploadProfilePhoto = (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return axiosInstance.post("/users/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getProfilePhotoUrl = () => {
    const token = localStorage.getItem("token");
    return `/api/users/me/photo?t=${Date.now()}`;
};