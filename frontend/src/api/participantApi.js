import axiosInstance from './axios';

export const getParticipants = async (search = '', limit = 10, offset = 0, workshopId = null) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (workshopId) params.append('workshop_id', workshopId);
    params.append('limit', limit);
    params.append('offset', offset);
    
    const response = await axiosInstance.get(`/api/participants?${params.toString()}`);
    return response.data;
};

export const getParticipantById = async (id) => {
    const response = await axiosInstance.get(`/api/participants/${id}`);
    return response.data;
};

export const createParticipant = async (participantData, workshopId = null) => {
    const data = workshopId ? { ...participantData, workshop_id: workshopId } : participantData;
    const response = await axiosInstance.post('/api/participants', data);
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

export const importParticipants = async (file, workshopId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (workshopId) {
        formData.append('workshop_id', workshopId);
    }
    
    const response = await axiosInstance.post('/api/participants/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
