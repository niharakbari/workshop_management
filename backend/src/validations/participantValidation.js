const { body } = require('express-validator');

const validateParticipant = [
    body('first_name').notEmpty().withMessage('First name is required').trim(),
    body('last_name').optional().trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('mobile').notEmpty().withMessage('Mobile number is required').trim(),
    body('organization').optional().trim()
];

module.exports = {
    validateParticipant
};
