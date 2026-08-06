import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => {
    return (
        <div className="empty-state">
            {Icon && <Icon size={48} />}
            <h3>{title}</h3>
            {message && <p>{message}</p>}
        </div>
    );
};

export default EmptyState;
