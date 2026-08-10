import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
});
//her giden isteği otomatik olarak yakalayıp üzerinde değişiklik yapabildiğimiz bir mekanizma=interceptors
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;