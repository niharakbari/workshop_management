import { useState, useCallback } from 'react';
import * as checkinApi from '../api/checkinApi';

export const useCheckins = () => {
    const [checkins, setCheckins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCheckedIn, setTotalCheckedIn] = useState(0);

    const fetchCheckins = useCallback(async (workshopId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await checkinApi.getHistory(workshopId);
            if (response.status === 'success') {
                setCheckins(response.data);
                setTotalCheckedIn(response.results);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch check-in history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkInParticipant = async (workshopId, registrationCode) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await checkinApi.checkIn(workshopId, registrationCode);
            if (response.status === 'success') {
                // Refresh history after successful checkin
                await fetchCheckins(workshopId);
                return response.data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check in participant');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        checkins,
        totalCheckedIn,
        isLoading,
        error,
        fetchCheckins,
        checkInParticipant
    };
};
