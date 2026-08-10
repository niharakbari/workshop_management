import { useState, useCallback } from 'react';
import * as workshopApi from '../api/workshopApi';
import toast from 'react-hot-toast';

export const useWorkshops = () => {
    const [workshops, setWorkshops] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWorkshops = useCallback(async (search = '', status = '', phase = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await workshopApi.getWorkshops(search, status, phase);
            setWorkshops(data.data);
            return data.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch workshops';
            setError(message);
            toast.error(message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createWorkshop = async (data) => {
        setIsLoading(true);
        try {
            await workshopApi.createWorkshop(data);
            toast.success('Workshop created successfully');
            await fetchWorkshops();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create workshop');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateWorkshop = async (id, data) => {
        setIsLoading(true);
        try {
            await workshopApi.updateWorkshop(id, data);
            toast.success('Workshop updated successfully');
            await fetchWorkshops();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update workshop');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        setIsLoading(true);
        try {
            await workshopApi.updateWorkshopStatus(id, status);
            toast.success(`Workshop marked as ${status}`);
            await fetchWorkshops();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteWorkshop = async (id) => {
        setIsLoading(true);
        try {
            await workshopApi.deleteWorkshop(id);
            toast.success('Workshop deleted');
            await fetchWorkshops();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete workshop');
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    const uploadBanner = async (id, file) => {
        setIsLoading(true);
        try {
            await workshopApi.uploadWorkshopBanner(id, file);
            toast.success('Banner uploaded successfully');
            await fetchWorkshops();
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload banner');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        workshops,
        isLoading,
        error,
        fetchWorkshops,
        createWorkshop,
        updateWorkshop,
        updateStatus,
        deleteWorkshop,
        uploadBanner
    };
};
