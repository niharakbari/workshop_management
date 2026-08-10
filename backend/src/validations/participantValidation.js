const { body } = require('express-validator');

const validateParticipant = [
    body('first_name').notEmpty().withMessage('First name is required').trim(),
    body('last_name').optional().trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('mobile')
        .notEmpty().withMessage('Mobile number is required')
        .matches(/^[0-9+\-\s()]+$/).withMessage('Mobile number can only contain digits and basic formatting characters')
        .custom((value) => {
            // Strip non-digits and check length
            const digits = value.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 15) {
                throw new Error('Mobile number must contain between 7 and 15 digits');
            }
            return true;
        })
        .trim(),
    body('organization').optional().trim()
];

module.exports = {
    validateParticipant
};
