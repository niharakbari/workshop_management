// import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useRegister } from '../hooks/useRegister';

const Register = () => {
    const { register, isLoading } = useRegister();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create an Account</h1>
                    <p>Join us today to get started</p>
                </div>
                
                <RegisterForm onSubmit={register} isLoading={isLoading} />

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
