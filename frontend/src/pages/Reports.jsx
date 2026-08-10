import React, { useState, useEffect } from 'react';
import { useWorkshops } from '../hooks/useWorkshops';
import Button from '../components/common/Button';
import { Download, FileSpreadsheet, Users, ClipboardList, CheckCircle } from 'lucide-react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Reports = () => {
    const { workshops, fetchWorkshops } = useWorkshops();
    
    // Filters for Registrations & Check-ins
    const [selectedWorkshop, setSelectedWorkshop] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        fetchWorkshops();
    }, [fetchWorkshops]);

    const handleDownload = async (type) => {
        setIsDownloading(true);
        try {
            let url = `/api/reports/${type}/export`;
            const params = new URLSearchParams();
            
            if (type === 'registrations' || type === 'checkins') {
                if (selectedWorkshop) params.append('workshop_id', selectedWorkshop);
            }
            if (type === 'registrations') {
                if (selectedStatus) params.append('status', selectedStatus);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axiosInstance.get(url, { responseType: 'blob' });
            
            // Create a blob link to download
            const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = urlBlob;
            link.setAttribute('download', `${type}_export_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success(`${type} exported successfully`);
        } catch (err) {
            toast.error(`Failed to export ${type}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Reports & Exports</h2>
                    <div className="page-subtitle">Download system data in CSV format.</div>
                </div>
            </div>

            <div className="user-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Export Filters</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 250px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Workshop</label>
                        <select 
                            className="form-input" 
                            value={selectedWorkshop}
                            onChange={(e) => setSelectedWorkshop(e.target.value)}
                        >
                            <option value="">All Workshops</option>
                            {workshops.map(w => (
                                <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                        </select>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Applies to Registrations and Check-ins exports
                        </div>
                    </div>
                    
                    <div style={{ flex: '1 1 250px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Registration Status</label>
                        <select 
                            className="form-input" 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="REGISTERED">Registered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Applies to Registrations export only
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* Participants Export */}
                <div className="user-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#10b98120', padding: '0.75rem', borderRadius: '50%' }}>
                            <Users size={24} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Participants Directory</h3>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Export all global participants.</div>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleDownload('participants')}
                        disabled={isDownloading}
                    >
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> Download CSV
                    </Button>
                </div>

                {/* Registrations Export */}
                <div className="user-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#f59e0b20', padding: '0.75rem', borderRadius: '50%' }}>
                            <ClipboardList size={24} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Registrations</h3>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Export workshop registrations.</div>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleDownload('registrations')}
                        disabled={isDownloading}
                    >
                        <FileSpreadsheet size={18} style={{ marginRight: '0.5rem' }} /> Download CSV
                    </Button>
                </div>

                {/* Check-ins Export */}
                <div className="user-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#6366f120', padding: '0.75rem', borderRadius: '50%' }}>
                            <CheckCircle size={24} style={{ color: '#6366f1' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>Check-ins History</h3>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Export physical check-in logs.</div>
                        </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleDownload('checkins')}
                        disabled={isDownloading}
                    >
                        <FileSpreadsheet size={18} style={{ marginRight: '0.5rem' }} /> Download CSV
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default Reports;
