import React, { useState, useEffect } from 'react';
import * as checkinApi from '../api/checkinApi';
import Table from '../components/common/Table';
import Spinner from '../components/common/Spinner';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const CheckInHistory = () => {
    const [checkins, setCheckins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await checkinApi.getCheckIns({ search });
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
        const socket = io('http://localhost:3000');
        socket.on('new_checkin', () => {
            fetchHistory(); // refresh on new check-in
        });
        return () => socket.disconnect();
    }, []);

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

            {isLoading && checkins.length === 0 ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={checkins} 
                    emptyMessage="No check-ins found."
                />
            )}
        </div>
    );
};

export default CheckInHistory;
