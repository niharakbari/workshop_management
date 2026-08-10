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

            <div 
                className="user-card" 
                style={{ 
                    marginBottom: '1.5rem', 
                    position: 'relative', 
                    height: '260px', 
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '2rem'
                }}
            >
                {/* Background Banner */}
                {workshop.banner_image ? (
                    <img 
                        src={`http://localhost:3000${workshop.banner_image}`} 
                        alt="Workshop Banner" 
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            zIndex: 0
                        }} 
                    />
                ) : (
                    <div 
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            background: 'linear-gradient(135deg, var(--primary) 0%, #1e1e2f 100%)',
                            zIndex: 0
                        }} 
                    />
                )}
                
                {/* Gradient Overlay for Text Readability */}
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '50%',
                        marginTop: 'auto',
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
                        zIndex: 1
                    }}
                />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, color: 'white', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '2.25rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)', letterSpacing: '-0.5px', fontWeight: 700, color: '#fff' }}>
                            {workshop.title}
                        </h2>
                    </div>
                    <div>
                        <Badge type={workshop.status === 'OPEN' || workshop.status === 'PUBLISHED' ? 'success' : workshop.status === 'CLOSED' ? 'danger' : 'neutral'}>
                            {workshop.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
                <TabButton tab="OVERVIEW" label="Overview" />
                {workshop.status === 'OPEN' && (
                    <TabButton tab="PARTICIPANTS" label="Participants" />
                )}
                <TabButton tab="REGISTRATIONS" label="Registrations" />
                <TabButton tab="CHECKIN" label="Check-In" />
                <TabButton tab="ANNOUNCEMENTS" label="Announcements" />
            </div>

            <div style={{ paddingBottom: '2rem' }}>
                {activeTab === 'OVERVIEW' && (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        <div className="user-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Statistics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="user-info-row">
                                    <span className="user-info-label">Total Registrations</span>
                                    <span className="user-info-value">{workshop.stats?.total_registrations || 0}</span>
                                </div>
                                <div className="user-info-row">
                                    <span className="user-info-label">Total Check-ins</span>
                                    <span className="user-info-value">{workshop.stats?.total_checkins || 0}</span>
                                </div>
                                <div className="user-info-row">
                                    <span className="user-info-label" style={{ color: 'var(--success)' }}>Present at Venue</span>
                                    <span className="user-info-value" style={{ fontWeight: 'bold' }}>{workshop.stats?.present || 0}</span>
                                </div>
                                <div className="user-info-row">
                                    <span className="user-info-label">Checked Out</span>
                                    <span className="user-info-value">{workshop.stats?.checked_out || 0}</span>
                                </div>
                                <div className="user-info-row" style={{ gridColumn: 'span 2' }}>
                                    <span className="user-info-label">Available Capacity</span>
                                    <span className="user-info-value">{workshop.stats?.available_capacity ?? workshop.capacity} / {workshop.capacity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="user-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Schedule</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <div className="user-info-label">Event Start</div>
                                    <div className="user-info-value">{workshop.start_datetime ? new Date(workshop.start_datetime.replace(' ', 'T')).toLocaleString() : 'TBD'}</div>
                                </div>
                                <div>
                                    <div className="user-info-label">Event End</div>
                                    <div className="user-info-value">{workshop.end_datetime ? new Date(workshop.end_datetime.replace(' ', 'T')).toLocaleString() : 'TBD'}</div>
                                </div>
                                <div>
                                    <div className="user-info-label">Registration Start</div>
                                    <div className="user-info-value">{workshop.registration_start ? new Date(workshop.registration_start.replace(' ', 'T')).toLocaleString() : 'TBD'}</div>
                                </div>
                                <div>
                                    <div className="user-info-label">Registration End</div>
                                    <div className="user-info-value">{workshop.registration_end ? new Date(workshop.registration_end.replace(' ', 'T')).toLocaleString() : 'TBD'}</div>
                                </div>
                            </div>
                        </div>
                        
                        {workshop.description && (
                            <div className="user-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Description</h3>
                                <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>{workshop.description}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'PARTICIPANTS' && workshop.status === 'OPEN' && (
                    <Participants workshopId={id} availableCapacity={workshop.stats?.available_capacity ?? workshop.capacity} />
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
