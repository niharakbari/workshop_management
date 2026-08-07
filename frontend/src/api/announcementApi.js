import axiosInstance from './axios';

export const getAnnouncements = async (workshop_id) => {
    const params = new URLSearchParams();
    if (workshop_id) params.append('workshop_id', workshop_id);
    const response = await axiosInstance.get(`/api/announcements?${params.toString()}`);
    return response.data;
};

export const createAnnouncement = async (announcementData) => {
    const response = await axiosInstance.post('/api/announcements', announcementData);
    return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
    const response = await axiosInstance.patch(`/api/announcements/${id}`, announcementData);
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await axiosInstance.delete(`/api/announcements/${id}`);
    return response.data;
};
