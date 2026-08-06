import React, { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import Input from '../common/Input';

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    date: yup.date().required('Workshop date is required').typeError('Invalid date'),
    registration_start_date: yup.date().required('Registration start date is required').typeError('Invalid date'),
    registration_end_date: yup.date()
        .required('Registration end date is required')
        .min(yup.ref('registration_start_date'), 'End date must be after start date')
        .max(yup.ref('date'), 'Registration must end before workshop starts')
        .typeError('Invalid date'),
    capacity: yup.number().positive('Capacity must be positive').integer().required('Capacity is required').typeError('Must be a number')
});

const WorkshopForm = ({ initialData, onSubmit, isLoading, onCancel }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useHookForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            date: '',
            registration_start_date: '',
            registration_end_date: '',
            capacity: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
                registration_start_date: initialData.registration_start_date ? new Date(initialData.registration_start_date).toISOString().slice(0, 16) : '',
                registration_end_date: initialData.registration_end_date ? new Date(initialData.registration_end_date).toISOString().slice(0, 16) : ''
            });
        }
    }, [initialData, reset]);

    const submitForm = (data) => {
        onSubmit({
            ...data,
            date: new Date(data.date).toISOString(),
            registration_start_date: new Date(data.registration_start_date).toISOString(),
            registration_end_date: new Date(data.registration_end_date).toISOString()
        });
    };

    return (
        <form onSubmit={handleSubmit(submitForm)}>
            <Input 
                label="Workshop Title"
                {...register('title')}
                error={errors.title?.message}
                placeholder="e.g. Advanced React Patterns"
            />
            
            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                    className={`form-input ${errors.description ? 'has-error' : ''}`}
                    rows={4}
                    {...register('description')}
                    placeholder="Brief description of the workshop..."
                />
                {errors.description && <span className="error-text">{errors.description.message}</span>}
            </div>

            <Input 
                label="Capacity"
                type="number"
                {...register('capacity')}
                error={errors.capacity?.message}
                placeholder="Number of participants"
            />

            <Input 
                label="Workshop Date & Time"
                type="datetime-local"
                {...register('date')}
                error={errors.date?.message}
            />

            <Input 
                label="Registration Start Date"
                type="datetime-local"
                {...register('registration_start_date')}
                error={errors.registration_start_date?.message}
            />

            <Input 
                label="Registration End Date"
                type="datetime-local"
                {...register('registration_end_date')}
                error={errors.registration_end_date?.message}
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? 'Update Workshop' : 'Create Workshop'}
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

export default WorkshopForm;
