// import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
    const { user, isLoading } = useDashboard();

    // Authentication and loading states are completely handled by ProtectedRoute.
    // By the time this component renders, `user` is guaranteed to be available.

    return (
        <div className="dashboard-container">
            <div className="page-header" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <h2 className="page-title">Dashboard</h2>
                <div className="page-subtitle">Welcome back, {user.name}! You are securely authenticated.</div>
            </div>
            
            <div className="user-card">
                <div className="user-info" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
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
