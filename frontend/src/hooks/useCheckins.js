import { useState, useCallback } from 'react';
import * as checkinApi from '../api/checkinApi';

export const useCheckins = () => {
    const [checkins, setCheckins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCheckedIn, setTotalCheckedIn] = useState(0);

    const fetchCheckins = useCallback(async (workshopId, search = '', limit = null, offset = null) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (search) params.search = search;
            if (limit !== null) params.limit = limit;
            if (offset !== null) params.offset = offset;
            
            const response = await checkinApi.getHistory(workshopId, params);
            if (response.status === 'success') {
                setCheckins(response.data);
                setTotalCheckedIn(response.total || 0);
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

    const checkOutParticipant = async (workshopId, checkinId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await checkinApi.checkOut(checkinId);
            if (response.status === 'success') {
                // Refresh history after successful checkout
                await fetchCheckins(workshopId);
                return response.data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check out participant');
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
        checkInParticipant,
        checkOutParticipant
    };
};
