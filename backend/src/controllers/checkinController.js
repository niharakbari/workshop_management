const checkinService = require('../services/checkinService');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

exports.checkIn = asyncHandler(async (req, res, next) => {
    // Check validation errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { workshop_id } = req.params;
    const { registration_code } = req.body;
    const staff_user_id = req.user.id;

    const result = await checkinService.processCheckin(registration_code, workshop_id, staff_user_id);
    
    res.status(201).json({
        status: 'success',
        message: 'Participant successfully checked in',
        data: result
    });
});

exports.getCheckIns = asyncHandler(async (req, res, next) => {
    const { workshop_id } = req.params;
    
    // Add pagination or search params if passed in query
    const { data, total } = await checkinService.getCheckinHistory(workshop_id, req.query);
    
    res.status(200).json({
        status: 'success',
        results: data.length,
        total,
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.offset ? parseInt(req.query.offset) : null,
        data
    });
});

exports.checkOut = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    await checkinService.processCheckout(id);
    
    res.status(200).json({
        status: 'success',
        message: 'Participant checked out successfully'
    });
});
