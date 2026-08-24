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

export const changePassword = (currentPassword, newPassword) =>
    axiosInstance.put("/users/me/password", { currentPassword, newPassword });

export const changeEmail = (newEmail, currentPassword) =>
    axiosInstance.put("/users/me/email", { newEmail, currentPassword });

export const changeUsername = (newUsername, currentPassword) =>
    axiosInstance.put("/users/me/username", { newUsername, currentPassword });

export const deleteAccount = (currentPassword) =>
    axiosInstance.delete("/users/me", { data: { currentPassword } });