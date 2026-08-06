import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api/authApi';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const register = async (data) => {
        setIsLoading(true);
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...submitData } = data;
            
            const response = await registerUser(submitData);
            
            toast.success(response.message || 'Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during registration. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading };
};
