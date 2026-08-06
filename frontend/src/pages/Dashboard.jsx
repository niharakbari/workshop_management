// import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
    const { user, isLoading, logout } = useDashboard();

    // Authentication and loading states are completely handled by ProtectedRoute.
    // By the time this component renders, `user` is guaranteed to be available.

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <button onClick={logout} className="btn-logout">
                    Logout
                </button>
            </div>
            
            <div className="user-card">
                <h3>Welcome back, {user.name}!</h3>
                <p style={{ color: 'var(--text-muted)' }}>You are securely authenticated.</p>
                
                <div className="user-info">
                    <div className="user-info-row">
                        <span className="user-info-label">Email Address</span>
                        <span className="user-info-value">{user.email}</span>
                    </div>
                    
                    <div className="user-info-row">
                        <span className="user-info-label">Role</span>
                        <div>
                            <span className="role-badge">
                                {user.role || 'User'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
