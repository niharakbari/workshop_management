import React, { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import Input from '../common/Input';

const schema = yup.object().shape({
    first_name: yup.string().required('First name is required'),
    last_name: yup.string(),
    email: yup.string().email('Invalid email').required('Email is required'),
    mobile: yup.string().required('Mobile number is required'),
    organization: yup.string()
});

const ParticipantForm = ({ initialData, onSubmit, isLoading, onCancel }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useHookForm({
        resolver: yupResolver(schema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            organization: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input 
                    label="First Name"
                    {...register('first_name')}
                    error={errors.first_name?.message}
                />
                <Input 
                    label="Last Name"
                    {...register('last_name')}
                    error={errors.last_name?.message}
                />
            </div>
            
            <Input 
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
            />
            
            <Input 
                label="Mobile Number"
                {...register('mobile')}
                error={errors.mobile?.message}
            />

            <Input 
                label="Organization (Optional)"
                {...register('organization')}
                error={errors.organization?.message}
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? 'Update Participant' : 'Add Participant'}
                </Button>
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

export default ParticipantForm;
