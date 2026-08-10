import React, { useEffect, useState } from 'react';
import { useWorkshops } from '../hooks/useWorkshops';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import WorkshopForm from '../components/workshops/WorkshopForm';
import { Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon, CalendarClock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Workshops = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse initial phase from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const initialPhase = queryParams.get('phase') || '';
    
    const { workshops, isLoading, fetchWorkshops, createWorkshop, updateWorkshop, deleteWorkshop, updateStatus, uploadBanner } = useWorkshops();
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [phaseFilter, setPhaseFilter] = useState(initialPhase);
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBannerOpen, setIsBannerOpen] = useState(false);
    const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
    
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [statusAction, setStatusAction] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchWorkshops(search, statusFilter, phaseFilter);
            
            // Sync phase filter to URL if changed
            const params = new URLSearchParams(location.search);
            if (phaseFilter) {
                params.set('phase', phaseFilter);
            } else {
                params.delete('phase');
            }
            navigate({ search: params.toString() }, { replace: true });
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, statusFilter, phaseFilter, fetchWorkshops, navigate, location.search]);

    const handleCreateOrEdit = async (data) => {
        let success;
        if (selectedWorkshop) {
            success = await updateWorkshop(selectedWorkshop.id, data);
        } else {
            success = await createWorkshop(data);
        }
        
        if (success) {
            setIsFormOpen(false);
            setSelectedWorkshop(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedWorkshop) return;
        const success = await deleteWorkshop(selectedWorkshop.id);
        if (success) {
            setIsDeleteOpen(false);
            setSelectedWorkshop(null);
        }
    };

    const handleBannerUpload = async (e) => {
        e.preventDefault();
        if (!bannerFile || !selectedWorkshop) return;
        const success = await uploadBanner(selectedWorkshop.id, bannerFile);
        if (success) {
            setIsBannerOpen(false);
            setSelectedWorkshop(null);
            setBannerFile(null);
            setBannerPreview(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleStatusClick = (workshop, newStatus) => {
        if (newStatus === 'CLOSED' || newStatus === 'CANCELLED') {
            setStatusAction({ workshop, newStatus });
            setIsStatusConfirmOpen(true);
        } else {
            updateStatus(workshop.id, newStatus);
        }
    };

    const confirmStatusChange = async () => {
        if (!statusAction) return;
        const success = await updateStatus(statusAction.workshop.id, statusAction.newStatus);
        if (success) {
            setIsStatusConfirmOpen(false);
            setStatusAction(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DRAFT': return <Badge type="DRAFT">Draft</Badge>;
            case 'OPEN': return <Badge type="success">Open</Badge>;
            case 'CLOSED': return <Badge type="danger">Closed</Badge>;
            default: return <Badge type="neutral">{status}</Badge>;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'TBD';
        const d = new Date(dateString.replace(' ', 'T'));
        return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const columns = [
        { 
            header: 'Workshop & Registration', 
            accessor: 'title',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {row.banner_image ? (
                        <img 
                            src={`http://localhost:3000${row.banner_image}`} 
                            alt="Banner" 
                            style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                            <ImageIcon size={16} />
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 600 }}>{row.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            <strong>Registration:</strong> {formatDateTime(row.registration_start)} - {formatDateTime(row.registration_end)}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Event Start',
            render: (row) => formatDateTime(row.start_datetime)
        },
        {
            header: 'Event End',
            render: (row) => formatDateTime(row.end_datetime)
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => getStatusBadge(row.status)
        },
        { 
            header: 'Capacity', 
            accessor: 'capacity' 
        },
        {
            header: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => {
                                setSelectedWorkshop(row);
                                setIsBannerOpen(true);
                            }} title="Upload Banner">
                                <ImageIcon size={14} />
                            </Button>
                            
                            {row.status === 'DRAFT' && (
                                <Button size="sm" variant="secondary" onClick={() => handleStatusClick(row, 'OPEN')} title="Publish">
                                    Publish
                                </Button>
                            )}
                            {(row.status === 'OPEN' || row.status === 'PUBLISHED') && (
                                <>
                                    <Button size="sm" variant="secondary" onClick={() => handleStatusClick(row, 'CLOSED')} title="Close Registration">
                                        Close Registration
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleStatusClick(row, 'CANCELLED')} title="Cancel Workshop">
                                        Cancel
                                    </Button>
                                </>
                            )}

                            <Button size="sm" variant="secondary" onClick={() => {
                                setSelectedWorkshop(row);
                                setIsFormOpen(true);
                            }}>
                                <Edit2 size={14} />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => {
                                setSelectedWorkshop(row);
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
                <div>
                    <h2 className="page-title">Workshops</h2>
                    <div className="page-subtitle">Manage workshops, schedules and registrations.</div>
                </div>
                {isAdmin && (
                    <Button onClick={() => {
                        setSelectedWorkshop(null);
                        setIsFormOpen(true);
                    }}>
                        <Plus size={18} /> New Workshop
                    </Button>
                )}
            </div>

            <div className="filters-bar">
                <div className="input-wrapper search-input">
                    <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Search workshops..." 
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                        <option value="DRAFT">Draft</option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="input-wrapper">
                    <CalendarClock size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <select 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={phaseFilter}
                        onChange={(e) => setPhaseFilter(e.target.value)}
                    >
                        <option value="">All Operational Phases</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="open_for_registration">Open for Registration</option>
                        <option value="registration_phase">Registration Phase</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {isLoading && !workshops.length ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={workshops} 
                    emptyMessage="Start by creating a new workshop."
                    onRowClick={(row) => navigate(`/workshops/${row.id}`)}
                    emptyAction={
                        isAdmin && (
                            <Button onClick={() => {
                                setSelectedWorkshop(null);
                                setIsFormOpen(true);
                            }}>
                                <Plus size={18} /> New Workshop
                            </Button>
                        )
                    }
                />
            )}

            {/* Create/Edit Modal */}
            <Modal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                title={selectedWorkshop ? 'Edit Workshop' : 'Create Workshop'}
            >
                <WorkshopForm 
                    initialData={selectedWorkshop} 
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
                        <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete Workshop</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete <strong>{selectedWorkshop?.title}</strong>? This action cannot be undone.</p>
            </Modal>

            {/* Status Change Confirmation Modal */}
            <Modal
                isOpen={isStatusConfirmOpen}
                onClose={() => setIsStatusConfirmOpen(false)}
                title={statusAction?.newStatus === 'CLOSED' ? "Confirm Close Registration" : "Confirm Cancellation"}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsStatusConfirmOpen(false)}>Back</Button>
                        <Button 
                            variant={statusAction?.newStatus === 'CANCELLED' ? "danger" : "primary"} 
                            onClick={confirmStatusChange} 
                            isLoading={isLoading}
                        >
                            {statusAction?.newStatus === 'CLOSED' ? "Close Registration" : "Cancel Workshop"}
                        </Button>
                    </>
                }
            >
                <p>
                    Are you sure you want to change the status of <strong>{statusAction?.workshop?.title}</strong> to <strong>{statusAction?.newStatus}</strong>?
                </p>
                {statusAction?.newStatus === 'CLOSED' && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        No more participants will be able to register, but existing ones will be kept.
                    </p>
                )}
                {statusAction?.newStatus === 'CANCELLED' && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>
                        This will mark the entire event as cancelled.
                    </p>
                )}
            </Modal>

            {/* Banner Upload Modal */}
            <Modal
                isOpen={isBannerOpen}
                onClose={() => {
                    setIsBannerOpen(false);
                    setBannerPreview(null);
                    setBannerFile(null);
                }}
                title="Upload Workshop Banner"
            >
                <form onSubmit={handleBannerUpload}>
                    <div className="form-group">
                        <label className="form-label">Select Image (JPEG, PNG, WEBP)</label>
                        <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png,.webp" 
                            className="form-input" 
                            onChange={handleFileChange}
                        />
                    </div>
                    {bannerPreview && (
                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            <img src={bannerPreview} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '200px', objectFit: 'cover' }} />
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsBannerOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading} disabled={!bannerFile}>Upload</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Workshops;
