const { body } = require('express-validator');

// Helper to convert date strings to timestamps for comparison
const toTime = (val) => new Date(val).getTime();

const validateWorkshop = [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('venue').notEmpty().withMessage('Venue is required').trim(),
    body('capacity')
        .isInt({ gt: 0 }).withMessage('Capacity must be greater than 0'),
    body('start_datetime')
        .isISO8601().withMessage('Valid start date is required'),
    body('end_datetime')
        .isISO8601().withMessage('Valid end date is required')
        .custom((end, { req }) => {
            if (toTime(end) <= toTime(req.body.start_datetime)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    body('registration_start')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Valid registration start date is required'),
    body('registration_end')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Valid registration end date is required')
        .custom((regEnd, { req }) => {
            const regStart = req.body.registration_start;
            const start = req.body.start_datetime;
            
            if (regStart && toTime(regEnd) < toTime(regStart)) {
                throw new Error('Registration end must be on or after registration start');
            }
            
            // [TEMPORARY/TESTING LOGIC] 
            // Allow registration_end to be after workshop start_datetime to test check-in logic
            // TODO: Restore this validation before production deployment
            /*
            if (start && toTime(regEnd) > toTime(start)) {
                throw new Error('Registration end must be before or exactly at workshop start time');
            }
            */
            return true;
        })
];

const validateWorkshopStatus = [
    body('status')
        .isIn(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED'])
        .withMessage('Invalid status')
];

module.exports = {
    validateWorkshop,
    validateWorkshopStatus
};
