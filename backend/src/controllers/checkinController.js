const checkinModel = require("../models/checkinModel");
const registrationModel = require("../models/registrationModel");

exports.checkIn = (req, res, next) => {
    const { registration_id } = req.body;
    const user_id = req.user.id;

    if (!registration_id) {
        return res.status(400).json({ success: false, message: "Registration ID is required" });
    }

    // 1. Check if registration exists and is valid
    registrationModel.findById(registration_id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        const registration = results[0];
        if (registration.status !== 'REGISTERED') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot check in. Registration status is ${registration.status}` 
            });
        }

        // 2. Check if already checked in
        checkinModel.findByRegistrationId(registration_id, (err, checkinResults) => {
            if (err) return next(err);
            if (checkinResults.length > 0) {
                return res.status(400).json({ success: false, message: "Participant is already checked in" });
            }

            // 3. Create checkin
            checkinModel.create(registration_id, user_id, (err, result) => {
                if (err) return next(err);
                
                // Emit socket event
                const io = req.app.get('io');
                if (io) {
                    io.to(`workshop_${registration.workshop_id}`).emit('new_checkin', {
                        registration_id,
                        workshop_id: registration.workshop_id
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Check-in successful",
                    data: {
                        id: result.insertId,
                        registration_id,
                        checked_in_at: new Date()
                    }
                });
            });
        });
    });
};

exports.getCheckIns = (req, res, next) => {
    const filters = {
        workshop_id: req.query.workshop_id,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
    };

    checkinModel.findAll(filters, (err, results) => {
        if (err) return next(err);
        res.status(200).json({
            success: true,
            results: results.length,
            data: results
        });
    });
};
