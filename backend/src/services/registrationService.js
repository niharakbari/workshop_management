const registrationModel = require("../models/registrationModel");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

const generateRegistrationCode = () => {
    // Generates a collision-safe code like REG-A1B2C3D4
    return `REG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const registerParticipant = (registrationData) => {
    return new Promise((resolve, reject) => {
        // Business logic: check for duplicate registration
        registrationModel.checkDuplicate(registrationData.participant_id, registrationData.workshop_id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                return reject(new AppError("This participant is already registered for this workshop.", 400));
            }

            const newRegistration = {
                ...registrationData,
                registration_code: generateRegistrationCode()
            };

            registrationModel.create(newRegistration, (createErr, result) => {
                if (createErr) return reject(createErr);
                resolve({ id: result.insertId, ...newRegistration, status: 'REGISTERED' });
            });
        });
    });
};

const getAllRegistrations = (filters) => {
    return new Promise((resolve, reject) => {
        registrationModel.findAll(filters, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const getRegistrationById = (id) => {
    return new Promise((resolve, reject) => {
        registrationModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Registration not found", 404));
            resolve(rows[0]);
        });
    });
};

const updateRegistrationStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        registrationModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Registration not found", 404));

            registrationModel.updateStatus(id, status, (updateErr) => {
                if (updateErr) return reject(updateErr);
                resolve(true);
            });
        });
    });
};

const cancelRegistration = (id) => {
    return updateRegistrationStatus(id, 'CANCELLED');
};

const deleteRegistration = (id) => {
    return new Promise((resolve, reject) => {
        registrationModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Registration not found", 404));
            
            registrationModel.deleteById(id, (deleteErr) => {
                if (deleteErr) return reject(deleteErr);
                resolve(true);
            });
        });
    });
};

module.exports = {
    registerParticipant,
    getAllRegistrations,
    getRegistrationById,
    updateRegistrationStatus,
    cancelRegistration,
    deleteRegistration
};
