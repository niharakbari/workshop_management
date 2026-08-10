const participantModel = require("../models/participantModel");
const registrationService = require("./registrationService");
const AppError = require("../utils/AppError");
const fs = require("fs");
const csv = require("csv-parser");
const db = require("../config/database");

const findOrCreateParticipant = (participantData, connection = null) => {
    return new Promise((resolve, reject) => {
        participantModel.findByEmailOrMobile(participantData.email, participantData.mobile, connection, (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                return resolve({ id: rows[0].id, ...rows[0] });
            }
            participantModel.create(participantData, connection, (createErr, result) => {
                if (createErr) return reject(createErr);
                resolve({ id: result.insertId, ...participantData });
            });
        });
    });
};

const createParticipant = (participantData, workshopId = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (workshopId) {
                db.getConnection(async (err, connection) => {
                    if (err) return reject(new AppError("Failed to connect to database for transaction", 500));
                    
                    connection.beginTransaction(async (txErr) => {
                        if (txErr) {
                            connection.release();
                            return reject(new AppError("Failed to start transaction", 500));
                        }
                        
                        try {
                            const participant = await findOrCreateParticipant(participantData, connection);
                            await registrationService.registerParticipant({ participant_id: participant.id, workshop_id: workshopId }, connection);
                            
                            connection.commit((commitErr) => {
                                if (commitErr) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        reject(new AppError("Failed to commit transaction", 500));
                                    });
                                }
                                connection.release();
                                resolve(participant);
                            });
                        } catch (regErr) {
                            connection.rollback(() => {
                                connection.release();
                                // Let the specific capacity/duplicate error bubble up to the controller
                                reject(regErr);
                            });
                        }
                    });
                });
                return; // Wait for the callback
            }

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
        } catch (error) {
            reject(error);
        }
    });
};

const importParticipantsFromCSV = (filePath, workshopId = null) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        
        try {
            // Read into memory (max 10MB) to fix Mac line endings and Windows BOM
            let fileContent = fs.readFileSync(filePath, 'utf-8');
            
            // Remove UTF-8 BOM if present (Windows Excel)
            fileContent = fileContent.replace(/^\uFEFF/, '');
            
            // Normalize Mac (\r) and Windows (\r\n) line endings to Unix (\n)
            fileContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            
            const { Readable } = require('stream');
            const stream = Readable.from(fileContent);

            stream
                .pipe(csv())
                .on("data", (data) => {
                    // Ensure required fields
                if (data.first_name && data.last_name && data.email && data.mobile && data.organization) {
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
                        await createParticipant(row, workshopId);
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
        } catch (err) {
            fs.unlink(filePath, () => {});
            reject(new AppError("Failed to read CSV file: " + err.message, 500));
        }
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
