// import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../common/Input';

// Validation Schema
const registerSchema = yup.object().shape({
    name: yup
        .string()
        .matches(/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces')
        .required('Name is required'),
    email: yup
        .string()
        .email('Invalid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[\W_]/, 'Password must contain at least one special character')
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

const RegisterForm = ({ onSubmit, isLoading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                error={errors.name}
            />

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

            <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword}
            />
            
            <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoading}
            >
                {isLoading ? <div className="spinner"></div> : 'Register'}
            </button>
        </form>
    );
};

export default RegisterForm;
