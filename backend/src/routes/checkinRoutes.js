const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Protect all check-in routes
router.use(protect);
// Only ADMIN and STAFF can manage check-ins
router.use(restrictTo('ADMIN', 'STAFF'));

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

// Check-out (Admin, Staff)
router.use(restrictTo('ADMIN', 'STAFF'));
router.patch('/:id/checkout', checkinController.checkOut);

module.exports = router;
