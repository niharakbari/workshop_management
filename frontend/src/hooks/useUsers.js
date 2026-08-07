import { useState, useCallback } from 'react';
import * as userApi from '../api/userApi';
import toast from 'react-hot-toast';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async (filters = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userApi.getUsers(filters);
            setUsers(data.data);
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch users';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateRole = async (userId, role) => {
        setIsLoading(true);
        try {
            const data = await userApi.updateUserRole(userId, role);
            toast.success(data.message);
            // Optionally update the local state instead of refetching
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: data.data.role } : u));
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user role');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        users,
        isLoading,
        error,
        fetchUsers,
        updateRole
    };
};
