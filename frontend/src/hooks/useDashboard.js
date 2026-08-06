import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export const useDashboard = () => {
    const navigate = useNavigate();
    const { user, isLoading, clearAuth } = useAuth();

    const logout = async () => {
        try {
            await logoutUser();
            clearAuth();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out properly, but session cleared locally.');
            clearAuth();
            navigate('/login');
        }
    };

    return { user, isLoading, logout };
};
