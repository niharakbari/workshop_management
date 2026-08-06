import axiosInstance from "./axios";

export const registerUser = async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
};

export const getMe = async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
};

export const logoutUser = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};

// You can call this if your access token is expired
export const refreshToken = async () => {
    const response = await axiosInstance.post("/auth/refresh");
    return response.data;
};
