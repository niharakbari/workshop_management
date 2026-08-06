import React, { useEffect, useState } from 'react';
import { useRegistrations } from '../hooks/useRegistrations';
import { useWorkshops } from '../hooks/useWorkshops';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import RegistrationForm from '../components/registrations/RegistrationForm';
import { Plus, XCircle, Trash2, Filter } from 'lucide-react';

const Registrations = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const { registrations, isLoading, fetchRegistrations, createRegistration, cancelRegistration, deleteRegistration, updateStatus } = useRegistrations();
    const { workshops, fetchWorkshops } = useWorkshops();
    
    const [workshopFilter, setWorkshopFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    useEffect(() => {
        fetchRegistrations(workshopFilter, statusFilter);
    }, [workshopFilter, statusFilter, fetchRegistrations]);

    useEffect(() => {
        fetchWorkshops(); // For the filter dropdown
    }, [fetchWorkshops]);

    const handleCreate = async (data) => {
        const success = await createRegistration(data);
        if (success) setIsFormOpen(false);
    };

    const handleDelete = async () => {
        if (!selectedRegistration) return;
        const success = await deleteRegistration(selectedRegistration.id);
        if (success) {
            setIsDeleteOpen(false);
            setSelectedRegistration(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'REGISTERED': return <Badge type="success">Registered</Badge>;
            case 'WAITLISTED': return <Badge type="warning">Waitlisted</Badge>;
            case 'CANCELLED': return <Badge type="danger">Cancelled</Badge>;
            default: return <Badge type="neutral">{status}</Badge>;
        }
    };

    const columns = [
        { 
            header: 'Reg Code', 
            accessor: 'registration_code',
            render: (row) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.registration_code}</span>
        },
        { 
            header: 'IDs', 
            render: (row) => (
                <div>
                    <div>Participant ID: {row.participant_id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workshop ID: {row.workshop_id}</div>
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => getStatusBadge(row.status)
        },
        { 
            header: 'Registered At', 
            render: (row) => new Date(row.registered_at).toLocaleString() 
        },
        {
            header: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isAdmin && (
                        <>
                            {row.status !== 'CANCELLED' && (
                                <Button size="sm" variant="secondary" onClick={() => cancelRegistration(row.id)} title="Cancel Registration">
                                    <XCircle size={14} style={{ color: 'var(--danger)' }} />
                                </Button>
                            )}
                            <Button size="sm" variant="danger" onClick={() => {
                                setSelectedRegistration(row);
                                setIsDeleteOpen(true);
                            }}>
                                <Trash2 size={14} />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Registrations</h2>
                {isAdmin && (
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus size={18} /> New Registration
                    </Button>
                )}
            </div>

            <div className="filters-bar">
                <div className="input-wrapper">
                    <Filter size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <select 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem', minWidth: '200px' }}
                        value={workshopFilter}
                        onChange={(e) => setWorkshopFilter(e.target.value)}
                    >
                        <option value="">All Workshops</option>
                        {workshops.map(w => (
                            <option key={w.id} value={w.id}>{w.title}</option>
                        ))}
                    </select>
                </div>
                
                <div className="input-wrapper">
                    <Filter size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <select 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="REGISTERED">Registered</option>
                        <option value="WAITLISTED">Waitlisted</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {isLoading && !registrations.length ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={registrations} 
                    emptyMessage="No registrations found."
                />
            )}

            {/* Create Modal */}
            <Modal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                title="Register Participant"
            >
                <RegistrationForm 
                    onSubmit={handleCreate}
                    isLoading={isLoading}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Confirm Deletion"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to completely delete registration <strong>{selectedRegistration?.registration_code}</strong>?</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>If you just want to cancel the registration, use the Cancel button instead.</p>
            </Modal>
        </div>
    );
};

export default Registrations;
