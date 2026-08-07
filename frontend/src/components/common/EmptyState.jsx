import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action }) => {
    return (
        <div className="empty-state">
            {Icon && <Icon size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{title}</h3>
            {message && <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{message}</p>}
            {action && <div>{action}</div>}
        </div>
    );
};

export default EmptyState;
