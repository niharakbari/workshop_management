import React, { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import Input from '../common/Input';

const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    venue: yup.string().required('Venue is required'),
    start_datetime: yup.date().required('Workshop start date is required').typeError('Invalid date'),
    end_datetime: yup.date()
        .required('Workshop end date is required')
        .min(yup.ref('start_datetime'), 'End date must be after start date')
        .typeError('Invalid date'),
    registration_start: yup.date().required('Registration start date is required').typeError('Invalid date'),
    registration_end: yup.date()
        .required('Registration end date is required')
        .min(yup.ref('registration_start'), 'Registration end must be after start')
        .max(yup.ref('start_datetime'), 'Registration must end before workshop starts')
        .typeError('Invalid date'),
    capacity: yup.number().positive('Capacity must be positive').integer().required('Capacity is required').typeError('Must be a number')
});

const WorkshopForm = ({ initialData, onSubmit, isLoading, onCancel }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useHookForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            venue: '',
            start_datetime: '',
            end_datetime: '',
            registration_start: '',
            registration_end: '',
            capacity: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                start_datetime: initialData.start_datetime ? new Date(initialData.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: initialData.end_datetime ? new Date(initialData.end_datetime).toISOString().slice(0, 16) : '',
                registration_start: initialData.registration_start ? new Date(initialData.registration_start).toISOString().slice(0, 16) : '',
                registration_end: initialData.registration_end ? new Date(initialData.registration_end).toISOString().slice(0, 16) : ''
            });
        }
    }, [initialData, reset]);

    const submitForm = (data) => {
        onSubmit({
            ...data,
            start_datetime: new Date(data.start_datetime).toISOString(),
            end_datetime: new Date(data.end_datetime).toISOString(),
            registration_start: new Date(data.registration_start).toISOString(),
            registration_end: new Date(data.registration_end).toISOString()
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
                label="Venue"
                {...register('venue')}
                error={errors.venue?.message}
                placeholder="e.g. Main Auditorium or Online (Zoom)"
            />

            <Input 
                label="Capacity"
                type="number"
                {...register('capacity')}
                error={errors.capacity?.message}
                placeholder="Number of participants"
            />

            <Input 
                label="Workshop Start Date & Time"
                type="datetime-local"
                {...register('start_datetime')}
                error={errors.start_datetime?.message}
            />

            <Input 
                label="Workshop End Date & Time"
                type="datetime-local"
                {...register('end_datetime')}
                error={errors.end_datetime?.message}
            />

            <Input 
                label="Registration Start Date"
                type="datetime-local"
                {...register('registration_start')}
                error={errors.registration_start?.message}
            />

            <Input 
                label="Registration End Date"
                type="datetime-local"
                {...register('registration_end')}
                error={errors.registration_end?.message}
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
