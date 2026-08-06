import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24, className = '' }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <Loader2 size={size} className={`spinner ${className}`} style={{ borderColor: 'var(--surface-border)', borderTopColor: 'var(--primary)' }} />
        </div>
    );
};

export default Spinner;
