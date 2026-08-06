const announcementService = require("../services/announcementService");

exports.createAnnouncement = async (req, res, next) => {
    try {
        const announcementData = {
            ...req.body,
            created_by: req.user.id
        };
        const announcement = await announcementService.createAnnouncement(announcementData);
        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            data: announcement
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllAnnouncements = async (req, res, next) => {
    try {
        const filters = {
            workshop_id: req.query.workshop_id
        };
        const announcements = await announcementService.getAllAnnouncements(filters);
        res.status(200).json({
            success: true,
            results: announcements.length,
            data: announcements
        });
    } catch (err) {
        next(err);
    }
};

exports.getAnnouncementById = async (req, res, next) => {
    try {
        const announcement = await announcementService.getAnnouncementById(req.params.id);
        res.status(200).json({
            success: true,
            data: announcement
        });
    } catch (err) {
        next(err);
    }
};

exports.updateAnnouncement = async (req, res, next) => {
    try {
        await announcementService.updateAnnouncement(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Announcement updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteAnnouncement = async (req, res, next) => {
    try {
        await announcementService.deleteAnnouncement(req.params.id);
        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};
