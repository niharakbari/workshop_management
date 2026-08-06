import React, { useEffect, useState } from 'react';
import { useWorkshops } from '../hooks/useWorkshops';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import WorkshopForm from '../components/workshops/WorkshopForm';
import { Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon } from 'lucide-react';

const Workshops = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const { workshops, isLoading, fetchWorkshops, createWorkshop, updateWorkshop, deleteWorkshop, updateStatus, uploadBanner } = useWorkshops();
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBannerOpen, setIsBannerOpen] = useState(false);
    
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchWorkshops(search, statusFilter);
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, statusFilter, fetchWorkshops]);

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DRAFT': return <Badge type="neutral">Draft</Badge>;
            case 'PUBLISHED': return <Badge type="success">Published</Badge>;
            case 'COMPLETED': return <Badge type="warning">Completed</Badge>;
            case 'CANCELLED': return <Badge type="danger">Cancelled</Badge>;
            default: return <Badge type="neutral">{status}</Badge>;
        }
    };

    const columns = [
        { 
            header: 'Workshop', 
            accessor: 'title',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{row.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(row.date).toLocaleDateString()}
                    </div>
                </div>
            )
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isAdmin && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => {
                                setSelectedWorkshop(row);
                                setIsBannerOpen(true);
                            }} title="Upload Banner">
                                <ImageIcon size={14} />
                            </Button>
                            
                            {row.status === 'DRAFT' && (
                                <Button size="sm" variant="secondary" onClick={() => updateStatus(row.id, 'PUBLISHED')} title="Publish">
                                    Publish
                                </Button>
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
                <h2 className="page-title">Workshops</h2>
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
                        <option value="PUBLISHED">Published</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {isLoading && !workshops.length ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={workshops} 
                    emptyMessage="No workshops found matching your criteria."
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
