const participantModel = require("../models/participantModel");
const AppError = require("../utils/AppError");
const fs = require("fs");
const csv = require("csv-parser");

const createParticipant = (participantData) => {
    return new Promise((resolve, reject) => {
        // Business logic: check duplicates first
        participantModel.findByEmailOrMobile(participantData.email, participantData.mobile, (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                return reject(new AppError("Participant with this email or mobile already exists", 400));
            }

            participantModel.create(participantData, (createErr, result) => {
                if (createErr) return reject(createErr);
                resolve({ id: result.insertId, ...participantData });
            });
        });
    });
};

const importParticipantsFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => {
                // Ensure required fields
                if (data.first_name && data.email && data.mobile) {
                    results.push(data);
                } else {
                    errors.push(`Row missing required fields: ${JSON.stringify(data)}`);
                }
            })
            .on("end", async () => {
                // Delete file after parsing
                fs.unlink(filePath, () => {});
                
                let successCount = 0;
                let failureCount = 0;

                // Process sequentially to handle DB transactions safely
                for (const row of results) {
                    try {
                        await createParticipant(row);
                        successCount++;
                    } catch (err) {
                        failureCount++;
                        errors.push(`Failed to import ${row.email}: ${err.message}`);
                    }
                }
                
                resolve({ successCount, failureCount, errors });
            })
            .on("error", (error) => {
                fs.unlink(filePath, () => {});
                reject(new AppError("Failed to parse CSV file", 500));
            });
    });
};

const getAllParticipants = (filters) => {
    return new Promise((resolve, reject) => {
        participantModel.findAll(filters, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const getParticipantById = (id) => {
    return new Promise((resolve, reject) => {
        participantModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Participant not found", 404));
            resolve(rows[0]);
        });
    });
};

const updateParticipant = (id, updates) => {
    return new Promise((resolve, reject) => {
        // Basic check for existence
        participantModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Participant not found", 404));

            participantModel.update(id, updates, (updateErr) => {
                if (updateErr) {
                    // Handle unique constraint violations gracefully
                    if (updateErr.code === 'ER_DUP_ENTRY') {
                        return reject(new AppError("Email or Mobile already in use by another participant", 400));
                    }
                    return reject(updateErr);
                }
                resolve(true);
            });
        });
    });
};

const deleteParticipant = (id) => {
    return new Promise((resolve, reject) => {
        participantModel.findById(id, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Participant not found", 404));
            
            participantModel.deleteById(id, (deleteErr) => {
                if (deleteErr) {
                    if (deleteErr.code === 'ER_ROW_IS_REFERENCED_2') {
                         return reject(new AppError("Cannot delete participant because they have active registrations.", 400));
                    }
                    return reject(deleteErr);
                }
                resolve(true);
            });
        });
    });
};

module.exports = {
    createParticipant,
    importParticipantsFromCSV,
    getAllParticipants,
    getParticipantById,
    updateParticipant,
    deleteParticipant
};
