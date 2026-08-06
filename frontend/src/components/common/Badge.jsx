import React from 'react';

const Badge = ({ type = 'neutral', children }) => {
    return (
        <span className={`badge badge-${type}`}>
            {children}
        </span>
    );
};

export default Badge;
