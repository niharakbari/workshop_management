import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as workshopApi from '../api/workshopApi';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Participants from './Participants';
import Registrations from './Registrations';
import AnnouncementsTab from '../components/workshops/AnnouncementsTab';
import CheckinTab from '../components/workshops/CheckinTab';

const WorkshopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workshop, setWorkshop] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await workshopApi.getWorkshopById(id);
                setWorkshop(data.data);
            } catch (err) {
                toast.error('Failed to load workshop details');
                navigate('/workshops');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (isLoading) return <Spinner />;
    if (!workshop) return null;

    const TabButton = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-light)',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
            }}
        >
            {label}
        </button>
    );

    return (
        <div>
            <Button variant="secondary" onClick={() => navigate('/workshops')} style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back to Workshops
            </Button>

            <div className="user-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{workshop.title}</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <Badge type={workshop.status === 'OPEN' || workshop.status === 'PUBLISHED' ? 'success' : workshop.status === 'CLOSED' ? 'danger' : 'neutral'}>
                                {workshop.status}
                            </Badge>
                        </div>
                    </div>
                    {workshop.banner_image && (
                        <img 
                            src={`http://localhost:3000${workshop.banner_image}`} 
                            alt="Banner" 
                            style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                        />
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
                <TabButton tab="OVERVIEW" label="Overview" />
                <TabButton tab="PARTICIPANTS" label="Participants" />
                <TabButton tab="REGISTRATIONS" label="Registrations" />
                <TabButton tab="CHECKIN" label="Check-In" />
                <TabButton tab="ANNOUNCEMENTS" label="Announcements" />
            </div>

            <div style={{ paddingBottom: '2rem' }}>
                {activeTab === 'OVERVIEW' && (
                    <div className="user-card">
                        <div className="user-info">
                            <p>{workshop.description}</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="user-info-row">
                                    <span className="user-info-label">Workshop Date</span>
                                    <span className="user-info-value">{new Date(workshop.start_datetime.replace(' ', 'T')).toLocaleString()}</span>
                                </div>
                                <div className="user-info-row">
                                    <span className="user-info-label">Capacity</span>
                                    <span className="user-info-value">{workshop.capacity}</span>
                                </div>
                                <div className="user-info-row">
                                    <span className="user-info-label">Registration Starts</span>
                                    <span className="user-info-value">{new Date(workshop.registration_start.replace(' ', 'T')).toLocaleString()}</span>
                                </div>
                                <div className="user-info-row">
                                    <span className="user-info-label">Registration Ends</span>
                                    <span className="user-info-value">{new Date(workshop.registration_end.replace(' ', 'T')).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'PARTICIPANTS' && (
                    <Participants workshopId={id} />
                )}

                {activeTab === 'REGISTRATIONS' && (
                    <Registrations workshopId={id} />
                )}

                {activeTab === 'CHECKIN' && (
                    <CheckinTab workshop={workshop} />
                )}

                {activeTab === 'ANNOUNCEMENTS' && (
                    <AnnouncementsTab workshopId={id} />
                )}
            </div>
        </div>
    );
};

export default WorkshopDetails;
