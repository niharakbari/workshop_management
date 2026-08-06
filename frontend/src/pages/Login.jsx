// import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
    const { login, isLoading } = useLogin();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Log in to your account to continue</p>
                </div>
                
                <LoginForm onSubmit={login} isLoading={isLoading} />

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Create one here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
