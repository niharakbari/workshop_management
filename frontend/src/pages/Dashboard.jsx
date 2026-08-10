import React, { useState, useEffect } from 'react';
import * as dashboardApi from '../api/dashboardApi';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, CheckCircle, Activity, CalendarClock, XCircle, DoorOpen, CalendarDays, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isPrivileged = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);

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
        { label: 'Total Check-ins', value: stats.totalCheckIns, icon: CheckCircle, color: '#6366f1', onClick: () => setIsOverviewOpen(true), clickable: true }
    ];

    const operationalCards = isPrivileged && stats.operationalStats ? [
        { label: 'Ongoing', value: stats.operationalStats.ongoing, icon: Activity, color: '#3b82f6', phase: 'ongoing' },
        { label: 'Upcoming', value: stats.operationalStats.upcoming, icon: CalendarClock, color: '#8b5cf6', phase: 'upcoming' },
        { label: 'Cancelled', value: stats.operationalStats.cancelled, icon: XCircle, color: '#ef4444', phase: 'cancelled' },
        { label: 'Open for Registration', value: stats.operationalStats.openForRegistration, icon: DoorOpen, color: '#10b981', phase: 'open_for_registration' },
        { label: 'Registration Phase', value: stats.operationalStats.registrationPhase, icon: CalendarDays, color: '#f59e0b', phase: 'registration_phase' },
        { label: 'Completed', value: stats.operationalStats.completed, icon: CheckSquare, color: '#64748b', phase: 'completed' }
    ] : [];

    const overviewColumns = [
        { header: 'Workshop', accessor: 'workshop', render: (row) => <span style={{ fontWeight: 500 }}>{row.workshop}</span> },
        { header: 'Status', render: (row) => <span style={{ fontSize: '0.875rem' }}>{row.status || '—'}</span> },
        { header: 'Total Check-ins', accessor: 'total_checked_in' },
        { header: 'Currently Present', accessor: 'currently_present', render: (row) => <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{row.currently_present}</span> },
        { header: 'Checked Out', accessor: 'checked_out' },
        { header: 'Available Capacity', accessor: 'available_capacity', render: (row) => <span style={{ color: 'var(--primary)' }}>{row.available_capacity}</span> },
        { header: 'Total Capacity', accessor: 'total_capacity' },
        { header: 'Event Window', render: (row) => (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Start: {row.workshop_start ? new Date(row.workshop_start.replace(' ', 'T')).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}</div>
                <div>End: {row.workshop_end ? new Date(row.workshop_end.replace(' ', 'T')).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}</div>
            </div>
        )}
    ];

    // Compute Summary Totals for Check-in Overview
    const overviewTotals = (stats.checkinOverview || []).reduce((acc, row) => ({
        checkins: acc.checkins + (parseInt(row.total_checked_in) || 0),
        present: acc.present + (parseInt(row.currently_present) || 0),
        checkedOut: acc.checkedOut + (parseInt(row.checked_out) || 0),
        availableCapacity: acc.availableCapacity + (parseInt(row.available_capacity) || 0)
    }), { checkins: 0, present: 0, checkedOut: 0, availableCapacity: 0 });

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
                        <div 
                            key={idx} 
                            className={`user-card ${card.clickable ? 'clickable-card' : ''}`} 
                            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: card.clickable ? 'pointer' : 'default', transition: 'all 0.2s' }}
                            onClick={card.onClick}
                        >
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

            {isPrivileged && (
                <>
                    <h3 style={{ marginBottom: '1rem' }}>Workshop Operations</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {operationalCards.map((card, idx) => {
                            const Icon = card.icon;
                            return (
                                <div 
                                    key={idx} 
                                    className="user-card clickable-card" 
                                    style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => navigate(`/workshops?phase=${card.phase}`)}
                                >
                                    <div style={{ backgroundColor: `${card.color}20`, padding: '0.75rem', borderRadius: '50%' }}>
                                        <Icon size={24} style={{ color: card.color }} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {card.label}
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                            {card.value || 0}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

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

            <Modal
                isOpen={isOverviewOpen}
                onClose={() => setIsOverviewOpen(false)}
                title="Check-in Overview"
                contentStyle={{ width: '90vw', maxWidth: '1400px', height: '80vh', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="user-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Total Check-ins</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>{overviewTotals.checkins}</div>
                    </div>
                    <div className="user-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Currently Present</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{overviewTotals.present}</div>
                    </div>
                    <div className="user-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Checked Out</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-light)' }}>{overviewTotals.checkedOut}</div>
                    </div>
                    <div className="user-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Available Capacity</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{overviewTotals.availableCapacity}</div>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Detailed breakdown across all workshops.
                </div>
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <Table 
                        columns={overviewColumns}
                        data={stats.checkinOverview || []}
                        emptyMessage="No check-in data available."
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
