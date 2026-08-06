import axiosInstance from './axios';

export const getParticipants = async (search = '', limit = 10, offset = 0) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit);
    params.append('offset', offset);
    
    const response = await axiosInstance.get(`/api/participants?${params.toString()}`);
    return response.data;
};

export const getParticipantById = async (id) => {
    const response = await axiosInstance.get(`/api/participants/${id}`);
    return response.data;
};

export const createParticipant = async (participantData) => {
    const response = await axiosInstance.post('/api/participants', participantData);
    return response.data;
};

export const updateParticipant = async (id, participantData) => {
    const response = await axiosInstance.patch(`/api/participants/${id}`, participantData);
    return response.data;
};

export const deleteParticipant = async (id) => {
    const response = await axiosInstance.delete(`/api/participants/${id}`);
    return response.data;
};

export const importParticipants = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/api/participants/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
