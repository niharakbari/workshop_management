import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as registrationApi from '../api/registrationApi';
import * as workshopApi from '../api/workshopApi';
import * as participantApi from '../api/participantApi';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { ArrowLeft, User, Calendar, MapPin, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const RegistrationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [workshop, setWorkshop] = useState(null);
    const [participant, setParticipant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const regData = await registrationApi.getRegistrationById(id);
                setRegistration(regData.data);
                
                if (regData.data) {
                    const [wsData, partData] = await Promise.all([
                        workshopApi.getWorkshopById(regData.data.workshop_id),
                        participantApi.getParticipantById(regData.data.participant_id)
                    ]);
                    setWorkshop(wsData.data);
                    setParticipant(partData.data);
                }
            } catch (err) {
                toast.error('Failed to load registration details');
                navigate('/registrations');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (isLoading) return <Spinner />;
    if (!registration || !workshop || !participant) return null;

    return (
        <div>
            <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back
            </Button>

            <div className="user-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Registration Details</h2>
                        <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                            {registration.registration_code}
                        </div>
                    </div>
                    <Badge type={registration.status === 'REGISTERED' ? 'success' : registration.status === 'CANCELLED' ? 'neutral' : 'warning'}>
                        {registration.status}
                    </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                            <User size={18} /> Participant
                        </h3>
                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{participant.first_name} {participant.last_name}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{participant.email}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{participant.mobile}</div>
                    </div>
                    
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
                            <Calendar size={18} /> Workshop
                        </h3>
                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{workshop.title}</div>
                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={14} /> {new Date(workshop.date).toLocaleDateString()}
                        </div>
                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <MapPin size={14} /> {workshop.venue}
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
                        <QrCode size={64} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Show at check-in</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetails;
