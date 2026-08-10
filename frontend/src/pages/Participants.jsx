import React, { useEffect, useState } from 'react';
import { useParticipants } from '../hooks/useParticipants';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import ParticipantForm from '../components/participants/ParticipantForm';
import CSVUploadModal from '../components/participants/CSVUploadModal';
import { Plus, Edit2, Trash2, Search, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Participants = ({ workshopId = null, availableCapacity = null }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const isFull = workshopId && availableCapacity !== null && availableCapacity <= 0;
    const { 
        participants, 
        totalResults, 
        isLoading, 
        fetchParticipants, 
        createParticipant, 
        updateParticipant, 
        deleteParticipant, 
        importCSV 
    } = useParticipants(workshopId);
    
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCsvOpen, setIsCsvOpen] = useState(false);
    
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    useEffect(() => {
        const debounce = setTimeout(() => {
            const offset = (page - 1) * limit;
            fetchParticipants(search, limit, offset);
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, page, fetchParticipants]);

    const handleCreateOrEdit = async (data) => {
        let success;
        if (selectedParticipant) {
            success = await updateParticipant(selectedParticipant.id, data);
        } else {
            success = await createParticipant(data);
        }
        
        if (success) {
            setIsFormOpen(false);
            setSelectedParticipant(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedParticipant) return;
        const success = await deleteParticipant(selectedParticipant.id);
        if (success) {
            setIsDeleteOpen(false);
            setSelectedParticipant(null);
            
            // Adjust pagination if deleted last item on page
            if (participants.length === 1 && page > 1) {
                setPage(page - 1);
            }
        }
    };

    const totalPages = Math.ceil(totalResults / limit) || 1;

    const columns = [
        { 
            header: 'Name', 
            render: (row) => <div style={{ fontWeight: 500 }}>{row.first_name} {row.last_name}</div>
        },
        { 
            header: 'Contact Info', 
            render: (row) => (
                <div>
                    <div>{row.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.mobile}</div>
                </div>
            )
        },
        { 
            header: 'Organization', 
            accessor: 'organization' 
        },
        {
            header: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => {
                                setSelectedParticipant(row);
                                setIsFormOpen(true);
                            }}>
                                <Edit2 size={14} />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => {
                                setSelectedParticipant(row);
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
            {!workshopId && (
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Participants</h2>
                        <div className="page-subtitle">Manage workshop participants.</div>
                    </div>
                    {canEdit && (
                        <div className="page-actions">
                            <Button variant="secondary" onClick={() => setIsCsvOpen(true)}>
                                <UploadCloud size={18} /> Import CSV
                            </Button>
                            <Button onClick={() => {
                                setSelectedParticipant(null);
                                setIsFormOpen(true);
                            }}>
                                <Plus size={18} /> Add Participant
                            </Button>
                        </div>
                    )}
                </div>
            )}
            
            {workshopId && canEdit && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                    {isFull ? (
                        <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                            Workshop Full
                        </div>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setIsCsvOpen(true)}>
                                <UploadCloud size={18} /> Import CSV
                            </Button>
                            <Button onClick={() => {
                                setSelectedParticipant(null);
                                setIsFormOpen(true);
                            }}>
                                <Plus size={18} /> Add Participant
                            </Button>
                        </>
                    )}
                </div>
            )}

            <div className="filters-bar">
                <div className="input-wrapper search-input">
                    <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Search by name, email, or mobile..." 
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to page 1 on search
                        }}
                    />
                </div>
            </div>

            {isLoading && !participants.length ? (
                <Spinner />
            ) : (
                <>
                    <Table 
                        columns={columns} 
                        data={participants} 
                        emptyMessage="Start by adding a participant or importing a CSV file."
                        onRowClick={(row) => navigate(`/participants/${row.id}`)}
                        emptyAction={
                            canEdit && !isFull && (
                                <Button onClick={() => {
                                    setSelectedParticipant(null);
                                    setIsFormOpen(true);
                                }}>
                                    <Plus size={18} /> Add Participant
                                </Button>
                            )
                        }
                    />
                    
                    {/* Pagination Controls */}
                    {totalResults > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 0.5rem' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalResults)} of {totalResults}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    disabled={page === 1} 
                                    onClick={() => setPage(page - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
                                    Page {page} of {totalPages}
                                </div>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    disabled={page === totalPages} 
                                    onClick={() => setPage(page + 1)}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            <Modal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                title={selectedParticipant ? 'Edit Participant' : 'Add Participant'}
            >
                <ParticipantForm 
                    initialData={selectedParticipant} 
                    onSubmit={handleCreateOrEdit}
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
                <p>Are you sure you want to delete <strong>{selectedParticipant?.first_name} {selectedParticipant?.last_name}</strong>?</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>This action cannot be undone and will fail if they have active registrations.</p>
            </Modal>

            {/* CSV Upload Modal */}
            <CSVUploadModal 
                isOpen={isCsvOpen} 
                onClose={() => setIsCsvOpen(false)} 
                onUpload={importCSV}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Participants;
