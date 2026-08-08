const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Protect all check-in routes
router.use(authMiddleware.protect);
// Only ADMIN and STAFF can manage check-ins
router.use(authMiddleware.restrictTo('ADMIN', 'STAFF'));

// Check in a participant
router.post(
    '/workshop/:workshop_id',
    [
        body('registration_code').notEmpty().withMessage('Registration code is required')
    ],
    checkinController.checkIn
);

// Get check-in history for a workshop
router.get('/workshop/:workshop_id', checkinController.getCheckIns);

module.exports = router;
