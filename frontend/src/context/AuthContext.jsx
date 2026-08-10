import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (username, password) => {
        const response = await axiosInstance.post("/auth/login", { username, password });
        const { token, username: returnedUsername, role } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ username: returnedUsername, role }));
        setUser({ username: returnedUsername, role });
    };

    const register = async (username, email, password) => {
        const response = await axiosInstance.post("/auth/register", { username, email, password });
        const { token, username: returnedUsername, role } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ username: returnedUsername, role }));
        setUser({ username: returnedUsername, role });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}