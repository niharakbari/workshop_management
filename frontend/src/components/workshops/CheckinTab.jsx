import React, { useEffect, useState } from 'react';
import { useCheckins } from '../../hooks/useCheckins';
import { useAuth } from '../../context/AuthContext';
import * as registrationApi from '../../api/registrationApi';
import Input from '../common/Input';
import Button from '../common/Button';
import Table from '../common/Table';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { CheckCircle, ClipboardCheck, Search } from 'lucide-react';

const CheckinTab = ({ workshop }) => {
    const workshopId = workshop?.id;
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isStaff = user?.role === 'STAFF';

    const { checkins, totalCheckedIn, isLoading, fetchCheckins, checkInParticipant } = useCheckins();
    const [registrationCode, setRegistrationCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchedParticipant, setSearchedParticipant] = useState(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [lastCheckedIn, setLastCheckedIn] = useState(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000); // Check every second for auto-updating UI
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (workshopId) {
            fetchCheckins(workshopId);
        }
    }, [workshopId, fetchCheckins]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!registrationCode.trim()) return;

        setIsSearching(true);
        setSearchedParticipant(null);
        setLastCheckedIn(null);

        try {
            const data = await registrationApi.getRegistrations(workshopId, '', '', registrationCode.trim());
            const codeUpper = registrationCode.trim().toUpperCase();
            const reg = data.data.find(r => r.registration_code === codeUpper) || data.data[0];
            
            if (reg) {
                setSearchedParticipant(reg);
            } else {
                toast.error('No participant found with this code.');
            }
        } catch (err) {
            console.error('Search failed:', err);
            toast.error('Failed to search registration.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCheckIn = async () => {
        if (!searchedParticipant) return;

        setIsCheckingIn(true);
        setLastCheckedIn(null);
        try {
            const data = await checkInParticipant(workshopId, searchedParticipant.registration_code);
            toast.success('Check-in successful!');
            setRegistrationCode('');
            setLastCheckedIn(data.participant);
            setSearchedParticipant(null);
        } catch (err) {
            console.error('Check-in failed:', err);
        } finally {
            setIsCheckingIn(false);
        }
    };

    if (isLoading && checkins.length === 0) return <Spinner />;

    // VIEWER cannot see check-in UI
    if (!isAdmin && !isStaff) {
        return (
            <EmptyState 
                icon={ClipboardCheck}
                title="Check-in Restricted"
                description="You do not have permission to view or manage check-ins."
            />
        );
    }

    const start = new Date(workshop.start_datetime);
    const end = new Date(workshop.end_datetime);
    const isBeforeStart = now < start;
    const isAfterEnd = now > end;
    const isCheckinActive = !isBeforeStart && !isAfterEnd;

    let statusMessage = "Check-in is open.";
    let statusColor = "var(--success)";
    if (isBeforeStart) {
        statusMessage = "Workshop hasn't started yet.";
        statusColor = "var(--warning)";
    } else if (isAfterEnd) {
        statusMessage = "Workshop has ended. Check-in is closed.";
        statusColor = "var(--danger)";
    }

    const columns = [
        { header: 'Registration Code', accessor: 'registration_code' },
        { 
            header: 'Participant', 
            accessor: (row) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.first_name} {row.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                </div>
            )
        },
        { 
            header: 'Checked In At', 
            accessor: (row) => new Date(row.checked_in_at).toLocaleString() 
        },
        { header: 'Checked In By', accessor: 'checked_in_by_name' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="user-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardCheck size={20} /> Perform Check-In
                </h3>

                <div style={{ 
                    padding: '1rem', 
                    backgroundColor: `rgba(255, 255, 255, 0.05)`, 
                    borderLeft: `4px solid ${statusColor}`,
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    fontWeight: 500
                }}>
                    {statusMessage}
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                        <Input 
                            label="Registration Code"
                            placeholder="Enter code (e.g. REG-12345)"
                            value={registrationCode}
                            onChange={(e) => {
                                setRegistrationCode(e.target.value.toUpperCase());
                                setSearchedParticipant(null);
                                setLastCheckedIn(null);
                            }}
                            disabled={isCheckingIn || isSearching || !isCheckinActive}
                        />
                    </div>
                    <Button type="submit" disabled={!registrationCode.trim() || isCheckingIn || isSearching || !isCheckinActive} isLoading={isSearching}>
                        <Search size={16} style={{ marginRight: '0.5rem' }} />
                        Search
                    </Button>
                </form>

                {searchedParticipant && (
                    <div style={{ 
                        marginTop: '1.5rem', 
                        padding: '1.5rem', 
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>
                                    {searchedParticipant.first_name} {searchedParticipant.last_name}
                                </h4>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{searchedParticipant.email}</div>
                                <div style={{ color: 'var(--text-muted)' }}>
                                    Status: <strong style={{ color: searchedParticipant.status === 'REGISTERED' ? 'var(--success)' : 'var(--danger)' }}>
                                        {searchedParticipant.status}
                                    </strong>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={handleCheckIn} 
                                isLoading={isCheckingIn}
                                disabled={!isCheckinActive || searchedParticipant.status !== 'REGISTERED'}
                            >
                                <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                                Complete Check-In
                            </Button>
                        </div>
                    </div>
                )}

                {lastCheckedIn && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '1rem', 
                        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'var(--success)'
                    }}>
                        <CheckCircle size={24} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Successfully checked in!</div>
                            <div>{lastCheckedIn.first_name} {lastCheckedIn.last_name} ({lastCheckedIn.email})</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="user-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Recent Check-ins</h3>
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                        Total Checked In: {totalCheckedIn}
                    </div>
                </div>

                {checkins.length > 0 ? (
                    <Table columns={columns} data={checkins} keyExtractor={(row) => row.id} />
                ) : (
                    <EmptyState 
                        icon={ClipboardCheck}
                        title="No Check-ins Yet"
                        description="No participants have been checked in for this workshop."
                    />
                )}
            </div>
        </div>
    );
};

export default CheckinTab;
