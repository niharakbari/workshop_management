import { useState, useCallback } from 'react';
import * as registrationApi from '../api/registrationApi';
import toast from 'react-hot-toast';

export const useRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRegistrations = useCallback(async (workshop_id = '', status = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await registrationApi.getRegistrations(workshop_id, status);
            setRegistrations(data.data);
            return data.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch registrations';
            setError(message);
            toast.error(message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createRegistration = async (data) => {
        setIsLoading(true);
        try {
            await registrationApi.createRegistration(data);
            toast.success('Registration successful');
            await fetchRegistrations();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        setIsLoading(true);
        try {
            await registrationApi.updateRegistrationStatus(id, status);
            toast.success('Registration status updated');
            await fetchRegistrations();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const cancelRegistration = async (id) => {
        setIsLoading(true);
        try {
            await registrationApi.cancelRegistration(id);
            toast.success('Registration cancelled');
            await fetchRegistrations();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel registration');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRegistration = async (id) => {
        setIsLoading(true);
        try {
            await registrationApi.deleteRegistration(id);
            toast.success('Registration deleted');
            await fetchRegistrations();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete registration');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        registrations,
        isLoading,
        error,
        fetchRegistrations,
        createRegistration,
        updateStatus,
        cancelRegistration,
        deleteRegistration
    };
};
