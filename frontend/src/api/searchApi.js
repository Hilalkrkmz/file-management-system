import axiosInstance from "./axiosInstance";

export const search = (query) => {
    return axiosInstance.get("/search", { params: { query } });
};
