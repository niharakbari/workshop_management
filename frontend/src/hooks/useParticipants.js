import { useState, useCallback } from 'react';
import * as participantApi from '../api/participantApi';
import toast from 'react-hot-toast';

export const useParticipants = (workshopId = null) => {
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);

    const fetchParticipants = useCallback(async (search = '', limit = 10, offset = 0) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await participantApi.getParticipants(search, limit, offset, workshopId);
            setParticipants(data.data);
            setTotalResults(data.results || data.data.length);
            return data.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch participants';
            setError(message);
            toast.error(message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createParticipant = async (data) => {
        setIsLoading(true);
        try {
            await participantApi.createParticipant(data, workshopId);
            toast.success('Participant added successfully');
            await fetchParticipants();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add participant');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateParticipant = async (id, data) => {
        setIsLoading(true);
        try {
            await participantApi.updateParticipant(id, data);
            toast.success('Participant updated successfully');
            await fetchParticipants();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update participant');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteParticipant = async (id) => {
        setIsLoading(true);
        try {
            await participantApi.deleteParticipant(id);
            toast.success('Participant deleted');
            await fetchParticipants();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete participant');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const importCSV = async (file) => {
        setIsLoading(true);
        try {
            const result = await participantApi.importParticipants(file, workshopId);
            toast.success(`Import complete! ${result.data.successCount} added.`);
            if (result.data.failureCount > 0) {
                toast.error(`${result.data.failureCount} rows failed. Check report.`);
            }
            await fetchParticipants();
            return result.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to import CSV');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        participants,
        totalResults,
        isLoading,
        error,
        fetchParticipants,
        createParticipant,
        updateParticipant,
        deleteParticipant,
        importCSV
    };
};
