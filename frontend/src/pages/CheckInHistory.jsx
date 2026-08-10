import React, { useState, useEffect } from 'react';
import * as checkinApi from '../api/checkinApi';
import Table from '../components/common/Table';
import Spinner from '../components/common/Spinner';
import { Search, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useWorkshops } from '../hooks/useWorkshops';
import Button from '../components/common/Button';

const CheckInHistory = () => {
    const navigate = useNavigate();
    const { workshops, fetchWorkshops } = useWorkshops();
    const [selectedWorkshop, setSelectedWorkshop] = useState('');
    
    const [checkins, setCheckins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    // Pagination state
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchWorkshops('', 'OPEN'); 
    }, [fetchWorkshops]);

    const fetchHistory = async () => {
        if (!selectedWorkshop) {
            setCheckins([]);
            setTotal(0);
            return;
        }
        setIsLoading(true);
        try {
            const params = { search };
            if (limit !== 'All') {
                params.limit = limit;
                params.offset = offset;
            }
            const data = await checkinApi.getHistory(selectedWorkshop, params);
            setCheckins(data.data);
            setTotal(data.total || 0);
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
    }, [search, selectedWorkshop, limit, offset]);

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

    const handleCheckOut = async (checkinId) => {
        try {
            await checkinApi.checkOut(checkinId);
            toast.success('Check-out successful!');
            fetchHistory(); // Refresh the list
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Check-out failed');
        }
    };

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
        },
        {
            header: 'Checked Out',
            render: (row) => {
                if (row.checked_out_at) {
                    const checkInTime = new Date(row.checked_in_at);
                    const checkOutTime = new Date(row.checked_out_at);
                    
                    const formatDuration = (start, end) => {
                        const diffMs = end - start;
                        const totalMinutes = Math.floor(diffMs / (1000 * 60));
                        const h = Math.floor(totalMinutes / 60);
                        const m = totalMinutes % 60;
                        if (h === 0) return `${m} minute${m !== 1 ? 's' : ''}`;
                        if (m === 0) return `${h} hour${h !== 1 ? 's' : ''}`;
                        return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
                    };

                    const durationStr = formatDuration(checkInTime, checkOutTime);
                    
                    return (
                        <div>
                            <div>{checkOutTime.toLocaleString()}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{durationStr}</div>
                        </div>
                    );
                }
                return (
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCheckOut(row.id);
                        }}
                    >
                        Check Out
                    </Button>
                );
            }
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
                        onChange={(e) => {
                            setSelectedWorkshop(e.target.value);
                            setOffset(0);
                        }}
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
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setOffset(0);
                        }}
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
                <>
                    <Table 
                        columns={columns} 
                        data={checkins} 
                        emptyMessage="No check-ins found."
                        onRowClick={(row) => navigate(`/registrations/${row.registration_id}`)}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Rows per page:</span>
                            <select 
                                className="form-input" 
                                style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
                                value={limit}
                                onChange={(e) => {
                                    setLimit(e.target.value === 'All' ? 'All' : parseInt(e.target.value));
                                    setOffset(0);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value="All">All</option>
                            </select>
                        </div>
                        
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {limit === 'All' ? (
                                `Showing all ${total} records`
                            ) : (
                                `Page ${Math.floor(offset / limit) + 1} of ${Math.ceil(total / limit) || 1} (${total} total records)`
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled={limit === 'All' || offset === 0}
                                onClick={() => setOffset(Math.max(0, offset - limit))}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled={limit === 'All' || offset + limit >= total}
                                onClick={() => setOffset(offset + limit)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CheckInHistory;
