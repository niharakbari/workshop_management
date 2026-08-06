const announcementModel = require("../models/announcementModel");
const AppError = require("../utils/AppError");

const createAnnouncement = (announcementData) => {
    return new Promise((resolve, reject) => {
        announcementModel.create(announcementData, (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, ...announcementData });
        });
    });
};

const getAllAnnouncements = (filters) => {
    return new Promise((resolve, reject) => {
        announcementModel.findAll(filters, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const getAnnouncementById = (id) => {
    return new Promise((resolve, reject) => {
        announcementModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Announcement not found", 404));
            resolve(rows[0]);
        });
    });
};

const updateAnnouncement = (id, updates) => {
    return new Promise((resolve, reject) => {
        announcementModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Announcement not found", 404));

            announcementModel.update(id, updates, (updateErr) => {
                if (updateErr) return reject(updateErr);
                resolve(true);
            });
        });
    });
};

const deleteAnnouncement = (id) => {
    return new Promise((resolve, reject) => {
        announcementModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Announcement not found", 404));
            
            announcementModel.deleteById(id, (deleteErr) => {
                if (deleteErr) return reject(deleteErr);
                resolve(true);
            });
        });
    });
};

module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
};
