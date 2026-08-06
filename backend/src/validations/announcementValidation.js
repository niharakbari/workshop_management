const { body } = require('express-validator');

const validateAnnouncement = [
    body('workshop_id').isInt().withMessage('Valid workshop ID is required'),
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('message').notEmpty().withMessage('Message is required').trim()
];

const validateAnnouncementUpdate = [
    body('title').optional().notEmpty().withMessage('Title cannot be empty if provided').trim(),
    body('message').optional().notEmpty().withMessage('Message cannot be empty if provided').trim()
];

module.exports = {
    validateAnnouncement,
    validateAnnouncementUpdate
};
