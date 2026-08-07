import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as registrationApi from '../api/registrationApi';
import * as checkinApi from '../api/checkinApi';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const CheckIn = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Socket setup (optional for this view, but good practice for real-time updates)
        const socket = io('http://localhost:3000');
        socket.on('new_checkin', (data) => {
            // Re-fetch or update local state if needed
            if (search.length > 2) handleSearch();
        });
        return () => socket.disconnect();
    }, [search]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (search.length < 3) {
            toast.error('Please enter at least 3 characters to search');
            return;
        }

        setIsLoading(true);
        try {
            const data = await registrationApi.getRegistrations('', '', '', search);
            setRegistrations(data.data);
        } catch (err) {
            toast.error('Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckIn = async (registrationId) => {
        try {
            await checkinApi.checkInParticipant(registrationId);
            toast.success('Check-in successful!');
            handleSearch(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Check-in Kiosk</h2>
                    <div className="page-subtitle">Search by Registration Code, Email, Mobile, or Name.</div>
                </div>
            </div>

            <div className="user-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-wrapper" style={{ flex: 1, margin: 0 }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-light)' }} />
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Enter Code, Email, Mobile..." 
                            style={{ paddingLeft: '2.5rem' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit" isLoading={isLoading}>Search</Button>
                </form>
            </div>

            {registrations.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {registrations.map(reg => (
                        <div key={reg.id} className="user-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.125rem' }}>
                                        {reg.registration_code}
                                    </div>
                                    <Badge type={reg.status === 'REGISTERED' ? 'success' : 'neutral'}>
                                        {reg.status}
                                    </Badge>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                    {reg.first_name} {reg.last_name}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    {reg.email} | {reg.mobile}
                                </div>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                                    Workshop: {reg.workshop_title}
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '1.5rem' }}>
                                {reg.status === 'REGISTERED' ? (
                                    <Button style={{ width: '100%' }} onClick={() => handleCheckIn(reg.id)}>
                                        <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Complete Check-in
                                    </Button>
                                ) : (
                                    <Button style={{ width: '100%' }} variant="secondary" disabled>
                                        <XCircle size={18} style={{ marginRight: '0.5rem' }} /> Cannot Check-in
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CheckIn;
