import axiosInstance from './axios';

export const getCheckIns = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.workshop_id) params.append('workshop_id', filters.workshop_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset !== undefined) params.append('offset', filters.offset);
    
    const response = await axiosInstance.get(`/api/checkins?${params.toString()}`);
    return response.data;
};

export const checkInParticipant = async (registration_id) => {
    const response = await axiosInstance.post('/api/checkins', { registration_id });
    return response.data;
};
