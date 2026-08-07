import axiosInstance from './axios';

export const getUsers = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset !== undefined) params.append('offset', filters.offset);
    
    const response = await axiosInstance.get(`/api/users?${params.toString()}`);
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await axiosInstance.patch(`/api/users/${userId}/role`, { role });
    return response.data;
};
