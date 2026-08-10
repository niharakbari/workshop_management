import axiosInstance from './axios';

export const getWorkshops = async (search = '', status = '', phase = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (phase) params.append('phase', phase);
    
    const response = await axiosInstance.get(`/api/workshops?${params.toString()}`);
    return response.data;
};

export const getWorkshopById = async (id) => {
    const response = await axiosInstance.get(`/api/workshops/${id}`);
    return response.data;
};

export const createWorkshop = async (workshopData) => {
    const response = await axiosInstance.post('/api/workshops', workshopData);
    return response.data;
};

export const updateWorkshop = async (id, workshopData) => {
    const response = await axiosInstance.patch(`/api/workshops/${id}`, workshopData);
    return response.data;
};

export const updateWorkshopStatus = async (id, status) => {
    const response = await axiosInstance.patch(`/api/workshops/${id}/status`, { status });
    return response.data;
};

export const uploadWorkshopBanner = async (id, file) => {
    const formData = new FormData();
    formData.append('banner', file);
    
    const response = await axiosInstance.patch(`/api/workshops/${id}/banner`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteWorkshop = async (id) => {
    const response = await axiosInstance.delete(`/api/workshops/${id}`);
    return response.data;
};
