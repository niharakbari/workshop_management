const { body } = require('express-validator');

const validateRegistration = [
    body('participant_id').isInt().withMessage('Valid participant ID is required'),
    body('workshop_id').isInt().withMessage('Valid workshop ID is required')
];

const validateRegistrationStatus = [
    body('status')
        .isIn(['REGISTERED', 'WAITLISTED', 'CANCELLED'])
        .withMessage('Invalid status. Must be REGISTERED, WAITLISTED, or CANCELLED')
];

module.exports = {
    validateRegistration,
    validateRegistrationStatus
};
