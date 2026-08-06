import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as workshopApi from '../api/workshopApi';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkshopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workshop, setWorkshop] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div>
            <Button variant="secondary" onClick={() => navigate('/workshops')} style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back to Workshops
            </Button>

            <div className="user-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2>{workshop.title}</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <Badge type={workshop.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                                {workshop.status}
                            </Badge>
                        </div>
                    </div>
                    {workshop.banner_url && (
                        <img 
                            src={`http://localhost:3000${workshop.banner_url}`} 
                            alt="Banner" 
                            style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                        />
                    )}
                </div>

                <div className="user-info">
                    <p>{workshop.description}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="user-info-row">
                            <span className="user-info-label">Workshop Date</span>
                            <span className="user-info-value">{new Date(workshop.date).toLocaleString()}</span>
                        </div>
                        <div className="user-info-row">
                            <span className="user-info-label">Capacity</span>
                            <span className="user-info-value">{workshop.capacity}</span>
                        </div>
                        <div className="user-info-row">
                            <span className="user-info-label">Registration Starts</span>
                            <span className="user-info-value">{new Date(workshop.registration_start_date).toLocaleString()}</span>
                        </div>
                        <div className="user-info-row">
                            <span className="user-info-label">Registration Ends</span>
                            <span className="user-info-value">{new Date(workshop.registration_end_date).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopDetails;
