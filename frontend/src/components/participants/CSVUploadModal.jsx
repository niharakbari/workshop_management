import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { UploadCloud } from 'lucide-react';

const CSVUploadModal = ({ isOpen, onClose, onUpload, isLoading }) => {
    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setReport(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        
        const result = await onUpload(file);
        if (result) {
            setReport(result);
            setFile(null);
        }
    };

    const handleClose = () => {
        setFile(null);
        setReport(null);
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title="Import Participants (CSV)"
        >
            {!report ? (
                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <UploadCloud size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                        <p style={{ marginBottom: '1rem' }}>Select a CSV file containing participant records.</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Required columns: first_name, email, mobile
                        </p>
                        <input 
                            type="file" 
                            accept=".csv,text/csv" 
                            onChange={handleFileChange}
                            className="form-input"
                        />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading} disabled={!file}>
                            Start Import
                        </Button>
                    </div>
                </form>
            ) : (
                <div>
                    <h4 style={{ marginBottom: '1rem' }}>Import Complete</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--success)', textAlign: 'center' }}>
                            <h2>{report.successCount}</h2>
                            <p>Successfully Added</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', textAlign: 'center' }}>
                            <h2>{report.failureCount}</h2>
                            <p>Failed to Add</p>
                        </div>
                    </div>

                    {report.errors && report.errors.length > 0 && (
                        <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', maxHeight: '150px', overflowY: 'auto' }}>
                            <h5 style={{ marginBottom: '0.5rem' }}>Error Log:</h5>
                            <ul style={{ fontSize: '0.75rem', color: 'var(--danger)', paddingLeft: '1rem' }}>
                                {report.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                        <Button onClick={handleClose}>Close</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CSVUploadModal;
