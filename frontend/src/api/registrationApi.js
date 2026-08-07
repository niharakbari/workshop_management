import axiosInstance from './axios';

export const getRegistrations = async (workshop_id = '', status = '', participant_id = '', search = '') => {
    const params = new URLSearchParams();
    if (workshop_id) params.append('workshop_id', workshop_id);
    if (status) params.append('status', status);
    if (participant_id) params.append('participant_id', participant_id);
    if (search) params.append('search', search);
    
    const response = await axiosInstance.get(`/api/registrations?${params.toString()}`);
    return response.data;
};

export const getRegistrationById = async (id) => {
    const response = await axiosInstance.get(`/api/registrations/${id}`);
    return response.data;
};

export const createRegistration = async (registrationData) => {
    const response = await axiosInstance.post('/api/registrations', registrationData);
    return response.data;
};

export const updateRegistrationStatus = async (id, status) => {
    const response = await axiosInstance.patch(`/api/registrations/${id}/status`, { status });
    return response.data;
};

export const cancelRegistration = async (id) => {
    const response = await axiosInstance.patch(`/api/registrations/${id}/cancel`);
    return response.data;
};

export const deleteRegistration = async (id) => {
    const response = await axiosInstance.delete(`/api/registrations/${id}`);
    return response.data;
};
