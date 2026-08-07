import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show a loading spinner while checkAuth is evaluating the token
    if (isLoading) {
        return (
            <div className="auth-container">
                <div className="spinner" style={{ 
                    borderColor: 'rgba(37, 99, 235, 0.2)', 
                    borderTopColor: 'var(--primary)', 
                    width: '40px', 
                    height: '40px' 
                }}></div>
            </div>
        );
    }

    // If loading has finished and the user is NOT authenticated,
    // safely redirect them to the login page instead of rendering a blank screen.
    if (!isAuthenticated) {
        // We can pass the location state so we can redirect them back after they log in (optional improvement)
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
