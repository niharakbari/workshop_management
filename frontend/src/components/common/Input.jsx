import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ 
    label, 
    type = 'text', 
    error, 
    ...props 
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <div className="input-wrapper">
                <input
                    ref={ref}
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={`form-input ${error ? 'has-error' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <span className="error-text">{typeof error === 'string' ? error : error.message}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
