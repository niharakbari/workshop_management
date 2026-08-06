import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    disabled = false, 
    className = '', 
    ...props 
}) => {
    const sizeClass = size === 'sm' ? 'btn-sm' : '';
    const variantClass = `btn-${variant}`;
    
    return (
        <button 
            className={`btn ${variantClass} ${sizeClass} ${className}`} 
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 size={16} className="spinner" style={{ borderColor: 'transparent', borderTopColor: 'currentColor' }} />}
            {children}
        </button>
    );
};

export default Button;
