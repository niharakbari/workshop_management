const registrationService = require("../services/registrationService");

exports.createRegistration = async (req, res, next) => {
    try {
        const registration = await registrationService.registerParticipant(req.body);
        res.status(201).json({
            success: true,
            message: "Participant registered successfully",
            data: registration
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllRegistrations = async (req, res, next) => {
    try {
        const filters = {
            workshop_id: req.query.workshop_id,
            status: req.query.status,
            participant_id: req.query.participant_id,
            search: req.query.search
        };
        const registrations = await registrationService.getAllRegistrations(filters);
        res.status(200).json({
            success: true,
            results: registrations.length,
            data: registrations
        });
    } catch (err) {
        next(err);
    }
};

exports.getRegistrationById = async (req, res, next) => {
    try {
        const registration = await registrationService.getRegistrationById(req.params.id);
        res.status(200).json({
            success: true,
            data: registration
        });
    } catch (err) {
        next(err);
    }
};

exports.updateRegistrationStatus = async (req, res, next) => {
    try {
        await registrationService.updateRegistrationStatus(req.params.id, req.body.status);
        res.status(200).json({
            success: true,
            message: "Registration status updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

exports.cancelRegistration = async (req, res, next) => {
    try {
        await registrationService.cancelRegistration(req.params.id);
        res.status(200).json({
            success: true,
            message: "Registration cancelled successfully"
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteRegistration = async (req, res, next) => {
    try {
        await registrationService.deleteRegistration(req.params.id);
        res.status(200).json({
            success: true,
            message: "Registration deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};
