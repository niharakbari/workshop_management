// import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../common/Input';

// Validation Schema
const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().required('Password is required'),
});

const LoginForm = ({ onSubmit, isLoading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email}
            />
            
            <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password}
            />
            
            <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoading}
            >
                {isLoading ? <div className="spinner"></div> : 'Log In'}
            </button>
        </form>
    );
};

export default LoginForm;
