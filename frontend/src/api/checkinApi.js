import axiosInstance from './axios';

// --- Phase 5 Methods ---

// Check in a participant
export const checkIn = async (workshopId, registrationCode) => {
    const response = await axiosInstance.post(`/api/checkins/workshop/${workshopId}`, {
        registration_code: registrationCode
    });
    return response.data;
};

// Get check-in history for a workshop
export const getHistory = async (workshopId, params = {}) => {
    const response = await axiosInstance.get(`/api/checkins/workshop/${workshopId}`, { params });
    return response.data;
};

// Check out a participant
export const checkOut = async (checkinId) => {
    const response = await axiosInstance.patch(`/api/checkins/${checkinId}/checkout`);
    return response.data;
};


// --- Legacy Methods for CheckIn.jsx and CheckInHistory.jsx ---

export const checkInParticipant = async (registrationId) => {
    const response = await axiosInstance.post('/api/checkins', { registration_id: registrationId });
    return response.data;
};

export const getCheckIns = async (params = {}) => {
    const response = await axiosInstance.get('/api/checkins', { params });
    return response.data;
};
