import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as announcementApi from '../../api/announcementApi';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import { Plus, Edit2, Trash2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const AnnouncementsTab = ({ workshopId }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [formData, setFormData] = useState({ title: '', message: '' });

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const data = await announcementApi.getAnnouncements(workshopId);
            setAnnouncements(data.data);
        } catch (err) {
            toast.error('Failed to load announcements');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [workshopId]);

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socket.emit('join_workshop', workshopId);
        
        socket.on('new_announcement', (ann) => {
            setAnnouncements(prev => [ann, ...prev]);
        });
        
        socket.on('announcement_updated', (ann) => {
            setAnnouncements(prev => prev.map(a => a.id === ann.id ? ann : a));
        });
        
        socket.on('announcement_deleted', (id) => {
            setAnnouncements(prev => prev.filter(a => a.id !== parseInt(id)));
        });

        return () => {
            socket.emit('leave_workshop', workshopId);
            socket.disconnect();
        };
    }, [workshopId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedAnnouncement) {
                await announcementApi.updateAnnouncement(selectedAnnouncement.id, formData);
                toast.success('Announcement updated');
            } else {
                await announcementApi.createAnnouncement({ ...formData, workshop_id: workshopId });
                toast.success('Announcement created');
            }
            setIsFormOpen(false);
            fetchAnnouncements(); // Can also rely on socket, but manual fetch ensures consistency
        } catch (err) {
            toast.error('Failed to save announcement');
        }
    };

    const handleDelete = async () => {
        if (!selectedAnnouncement) return;
        try {
            await announcementApi.deleteAnnouncement(selectedAnnouncement.id);
            toast.success('Announcement deleted');
            setIsDeleteOpen(false);
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to delete announcement');
        }
    };

    const openCreateForm = () => {
        setSelectedAnnouncement(null);
        setFormData({ title: '', message: '' });
        setIsFormOpen(true);
    };

    const openEditForm = (ann) => {
        setSelectedAnnouncement(ann);
        setFormData({ title: ann.title, message: ann.message });
        setIsFormOpen(true);
    };

    return (
        <div>
            {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <Button onClick={openCreateForm}>
                        <Plus size={18} /> New Announcement
                    </Button>
                </div>
            )}

            {isLoading && announcements.length === 0 ? (
                <Spinner />
            ) : announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                    <Bell size={48} style={{ color: 'var(--surface-border)', margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0 }}>No announcements yet for this workshop.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {announcements.map(ann => (
                        <div key={ann.id} className="user-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>{ann.title}</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{ann.message}</p>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
                                    Posted on {new Date(ann.created_at).toLocaleString()}
                                </div>
                            </div>
                            {isAdmin && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="secondary" onClick={() => openEditForm(ann)}>
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => {
                                        setSelectedAnnouncement(ann);
                                        setIsDeleteOpen(true);
                                    }}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                title={selectedAnnouncement ? "Edit Announcement" : "New Announcement"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="form-label">Title</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            required 
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="form-label">Message</label>
                        <textarea 
                            className="form-input" 
                            rows="4" 
                            required 
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Confirm Deletion"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete this announcement?</p>
            </Modal>
        </div>
    );
};

export default AnnouncementsTab;
