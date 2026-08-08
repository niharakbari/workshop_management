import React, { useState, useEffect } from 'react';
import * as checkinApi from '../api/checkinApi';
import Table from '../components/common/Table';
import Spinner from '../components/common/Spinner';
import { Search, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useWorkshops } from '../hooks/useWorkshops';

const CheckInHistory = () => {
    const navigate = useNavigate();
    const { workshops, fetchWorkshops } = useWorkshops();
    const [selectedWorkshop, setSelectedWorkshop] = useState('');
    
    const [checkins, setCheckins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchWorkshops('', 'OPEN'); 
    }, [fetchWorkshops]);

    const fetchHistory = async () => {
        if (!selectedWorkshop) {
            setCheckins([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await checkinApi.getHistory(selectedWorkshop, { search });
            setCheckins(data.data);
        } catch (err) {
            toast.error('Failed to load check-in history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchHistory();
        }, 500);
        return () => clearTimeout(debounce);
    }, [search]);

    useEffect(() => {
        if (!selectedWorkshop) return;
        
        const socket = io('http://localhost:3000');
        socket.emit('join_workshop', selectedWorkshop);
        
        socket.on('new_checkin', () => {
            fetchHistory(); // refresh on new check-in
        });
        
        return () => {
            socket.emit('leave_workshop', selectedWorkshop);
            socket.disconnect();
        };
    }, [selectedWorkshop]);

    const columns = [
        { 
            header: 'Reg Code', 
            accessor: 'registration_code',
            render: (row) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.registration_code}</span>
        },
        { 
            header: 'Participant', 
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.first_name} {row.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                </div>
            )
        },
        { 
            header: 'Workshop', 
            accessor: 'workshop_title'
        },
        { 
            header: 'Checked In At', 
            render: (row) => new Date(row.checked_in_at).toLocaleString() 
        },
        {
            header: 'Checked In By',
            render: (row) => row.checker_first_name ? `${row.checker_first_name} ${row.checker_last_name}` : 'System'
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Check-in History</h2>
                    <div className="page-subtitle">Real-time log of all participant check-ins.</div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="input-wrapper" style={{ minWidth: '300px' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-light)' }} />
                    <select 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={selectedWorkshop}
                        onChange={(e) => setSelectedWorkshop(e.target.value)}
                    >
                        <option value="">-- Select Workshop --</option>
                        {workshops.map(w => (
                            <option key={w.id} value={w.id}>{w.title}</option>
                        ))}
                    </select>
                </div>

                <div className="input-wrapper search-input">
                    <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Search by name, email, or code..." 
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {!selectedWorkshop ? (
                <div className="user-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Please select a workshop to view check-in history.
                </div>
            ) : isLoading && checkins.length === 0 ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={checkins} 
                    emptyMessage="No check-ins found."
                    onRowClick={(row) => navigate(`/registrations/${row.registration_id}`)}
                />
            )}
        </div>
    );
};

export default CheckInHistory;
