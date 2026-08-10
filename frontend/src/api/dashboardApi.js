import axiosInstance from './axios';

export const getStats = async () => {
    const response = await axiosInstance.get('/api/dashboard/stats');
    return response.data;
};
