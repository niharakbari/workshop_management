import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { updateAuth } = useAuth();

    const login = async (data) => {
        setIsLoading(true);
        try {
            const response = await loginUser(data);
            
            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
            }
            
            // Update global auth state
            if (response.user) {
                updateAuth(response.user);
            }
            
            toast.success(response.message || 'Logged in successfully!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during login. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading };
};
