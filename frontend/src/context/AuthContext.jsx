import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await getMe();
            setUser(response.user);
        } catch (error) {
            console.error('Auth verification failed:', error);
            
            // If the user had a token but verification failed (meaning refresh also failed),
            // notify them that their session expired.
            if (localStorage.getItem('accessToken')) {
                toast.error('Your session has expired. Please log in again.', { id: 'session-expired' });
            }
            
            localStorage.removeItem('accessToken');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Provide a way to manually update user state after login/logout
    const updateAuth = (userData) => {
        setUser(userData);
    };

    const clearAuth = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, updateAuth, clearAuth, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
