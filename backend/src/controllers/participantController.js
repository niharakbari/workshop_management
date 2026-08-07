const participantService = require("../services/participantService");
const AppError = require("../utils/AppError");

exports.createParticipant = async (req, res, next) => {
    try {
        const { workshop_id, ...participantData } = req.body;
        const participant = await participantService.createParticipant(participantData, workshop_id);
        res.status(201).json({
            success: true,
            message: "Participant created successfully",
            data: participant
        });
    } catch (err) {
        next(err); // Passes AppError or DB error to globalErrorHandler
    }
};

exports.importParticipants = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError("Please upload a CSV file", 400));
        }

        const workshop_id = req.body.workshop_id || null;
        const importResult = await participantService.importParticipantsFromCSV(req.file.path, workshop_id);
        
        res.status(200).json({
            success: true,
            message: "CSV import completed",
            data: importResult
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllParticipants = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            workshop_id: req.query.workshop_id,
            limit: req.query.limit,
            offset: req.query.offset
        };
        const participants = await participantService.getAllParticipants(filters);
        res.status(200).json({
            success: true,
            results: participants.length,
            data: participants
        });
    } catch (err) {
        next(err);
    }
};

exports.getParticipantById = async (req, res, next) => {
    try {
        const participant = await participantService.getParticipantById(req.params.id);
        res.status(200).json({
            success: true,
            data: participant
        });
    } catch (err) {
        next(err);
    }
};

exports.updateParticipant = async (req, res, next) => {
    try {
        await participantService.updateParticipant(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Participant updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteParticipant = async (req, res, next) => {
    try {
        await participantService.deleteParticipant(req.params.id);
        res.status(200).json({
            success: true,
            message: "Participant deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};
