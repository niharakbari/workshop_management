import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as participantApi from '../api/participantApi';
import * as registrationApi from '../api/registrationApi';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import { ArrowLeft, User, Briefcase, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const ParticipantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [participant, setParticipant] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const participantData = await participantApi.getParticipantById(id);
                setParticipant(participantData.data);
                
                const regData = await registrationApi.getRegistrations('', '', id);
                setRegistrations(regData.data);
            } catch (err) {
                toast.error('Failed to load participant details');
                navigate('/participants');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (isLoading) return <Spinner />;
    if (!participant) return null;

    const columns = [
        { 
            header: 'Workshop', 
            accessor: 'workshop_title',
            render: (row) => <div style={{ fontWeight: 500 }}>{row.workshop_title}</div>
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => (
                <Badge type={row.status === 'REGISTERED' ? 'success' : row.status === 'CANCELLED' ? 'neutral' : 'warning'}>
                    {row.status}
                </Badge>
            )
        },
        { 
            header: 'Registration Date', 
            accessor: 'registered_at',
            render: (row) => new Date(row.registered_at).toLocaleDateString()
        }
    ];

    return (
        <div>
            <Button variant="secondary" onClick={() => navigate('/participants')} style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to Participants
            </Button>

            <div className="user-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>
                        {participant.first_name[0]}{participant.last_name ? participant.last_name[0] : ''}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{participant.first_name} {participant.last_name}</h2>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Participant Profile</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Mail size={18} style={{ color: 'var(--text-light)' }} />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                            <div style={{ fontWeight: 500 }}>{participant.email}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Phone size={18} style={{ color: 'var(--text-light)' }} />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile Number</div>
                            <div style={{ fontWeight: 500 }}>{participant.mobile}</div>
                        </div>
                    </div>
                    {participant.organization && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Briefcase size={18} style={{ color: 'var(--text-light)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization</div>
                                <div style={{ fontWeight: 500 }}>{participant.organization}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Registered Workshops
                    <Badge type="neutral">{registrations.length}</Badge>
                </h3>
                <Table 
                    columns={columns} 
                    data={registrations} 
                    emptyMessage="This participant has not registered for any workshops yet."
                    onRowClick={(row) => navigate(`/workshops/${row.workshop_id}`)}
                />
            </div>
        </div>
    );
};

export default ParticipantDetails;
