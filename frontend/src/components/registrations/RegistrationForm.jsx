import React, { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../common/Button';
import { useWorkshops } from '../../hooks/useWorkshops';
import { useParticipants } from '../../hooks/useParticipants';

const schema = yup.object().shape({
    participant_id: yup.number().positive().integer().required('Participant is required').typeError('Participant is required'),
    workshop_id: yup.number().positive().integer().required('Workshop is required').typeError('Workshop is required')
});

const RegistrationForm = ({ onSubmit, isLoading, onCancel }) => {
    const { workshops, fetchWorkshops } = useWorkshops();
    const { participants, fetchParticipants } = useParticipants();

    const { register, handleSubmit, formState: { errors } } = useHookForm({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        // Fetch data for dropdowns (limit 100 for simplicity in this demo)
        fetchWorkshops();
        fetchParticipants('', 100, 0);
    }, [fetchWorkshops, fetchParticipants]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
                <label className="form-label">Select Participant</label>
                <select className={`form-input ${errors.participant_id ? 'has-error' : ''}`} {...register('participant_id')}>
                    <option value="">-- Choose a Participant --</option>
                    {participants.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.first_name} {p.last_name} ({p.email})
                        </option>
                    ))}
                </select>
                {errors.participant_id && <span className="error-text">{errors.participant_id.message}</span>}
            </div>

            <div className="form-group">
                <label className="form-label">Select Workshop</label>
                <select className={`form-input ${errors.workshop_id ? 'has-error' : ''}`} {...register('workshop_id')}>
                    <option value="">-- Choose a Workshop --</option>
                    {workshops.map(w => (
                        <option key={w.id} value={w.id}>
                            {w.title} ({new Date(w.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
                {errors.workshop_id && <span className="error-text">{errors.workshop_id.message}</span>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" isLoading={isLoading}>
                    Register Participant
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

export default RegistrationForm;
