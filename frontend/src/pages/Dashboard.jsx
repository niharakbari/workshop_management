import React, { useState, useEffect } from 'react';
import * as dashboardApi from '../api/dashboardApi';
import Spinner from '../components/common/Spinner';
import { LayoutDashboard, Users, ClipboardList, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await dashboardApi.getStats();
            setStats(data.data);
        } catch (err) {
            toast.error('Failed to load dashboard statistics');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        const socket = io('http://localhost:3000');
        socket.on('new_checkin_global', () => {
            fetchStats();
        });
        socket.on('new_registration_global', () => {
            fetchStats();
        });

        return () => socket.disconnect();
    }, []);

    if (isLoading && !stats) return <Spinner />;
    if (!stats) return <div>Failed to load dashboard.</div>;

    const statCards = [
        { label: 'Total Workshops', value: stats.totalWorkshops, subValue: `${stats.activeWorkshops} Active`, icon: LayoutDashboard, color: 'var(--primary)' },
        { label: 'Total Participants', value: stats.totalParticipants, icon: Users, color: '#10b981' },
        { label: 'Total Registrations', value: stats.totalRegistrations, icon: ClipboardList, color: '#f59e0b' },
        { label: 'Total Check-ins', value: stats.totalCheckIns, icon: CheckCircle, color: '#6366f1' }
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Dashboard</h2>
                    <div className="page-subtitle">Real-time overview of the system.</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="user-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: `${card.color}20`, padding: '1rem', borderRadius: '50%' }}>
                                <Icon size={32} style={{ color: card.color }} />
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    {card.label}
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                    {card.value}
                                </div>
                                {card.subValue && (
                                    <div style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
                                        {card.subValue}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="user-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                {stats.recentActivity.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>No recent activity found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentActivity.map((activity, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius)' }}>
                                {activity.type === 'CHECKIN' ? (
                                    <CheckCircle size={24} style={{ color: '#10b981' }} />
                                ) : (
                                    <ClipboardList size={24} style={{ color: '#f59e0b' }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>
                                        {activity.first_name} {activity.last_name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {activity.type === 'CHECKIN' ? 'Checked in to' : 'Registered for'} <span style={{ fontWeight: 500, color: 'var(--text)' }}>{activity.workshop}</span>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                                    {new Date(activity.date).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
