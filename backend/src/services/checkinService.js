const checkinModel = require('../models/checkinModel');
const registrationModel = require('../models/registrationModel');
const AppError = require('../utils/AppError');

const processCheckin = (registration_code, workshop_id, staff_user_id) => {
    return new Promise((resolve, reject) => {
        // 1. Find the registration by its unique code
        registrationModel.findByCode(registration_code, (err, results) => {
            if (err) return reject(new AppError('Database error finding registration', 500));
            if (results.length === 0) return reject(new AppError('Invalid registration code', 404));

            const registration = results[0];

            // 2. Verify it belongs to the current workshop
            if (registration.workshop_id !== parseInt(workshop_id)) {
                return reject(new AppError('This registration code is for a different workshop', 400));
            }

            // 3. Verify status is REGISTERED
            if (registration.status !== 'REGISTERED') {
                return reject(new AppError(`Cannot check in. Registration status is ${registration.status}`, 400));
            }

            // 3.5 Verify time window
            const now = new Date();
            const startDate = new Date(registration.start_datetime);
            const endDate = new Date(registration.end_datetime);

            if (now < startDate) {
                return reject(new AppError("Workshop hasn't started yet.", 400));
            }
            if (now > endDate) {
                return reject(new AppError("Workshop has ended. Check-in is closed.", 400));
            }

            // 4. Verify they haven't already checked in
            checkinModel.findByRegistrationId(registration.id, (err, checkinResults) => {
                if (err) return reject(new AppError('Database error checking previous check-ins', 500));
                
                if (checkinResults.length > 0) {
                    return reject(new AppError('Participant has already checked in', 400));
                }

                // 5. Create the checkin
                checkinModel.create(registration.id, staff_user_id, (err, insertResult) => {
                    if (err) return reject(new AppError('Database error creating checkin', 500));
                    
                    // Return the participant details to display a success message on the frontend
                    resolve({
                        id: insertResult.insertId,
                        registration_id: registration.id,
                        participant: {
                            first_name: registration.first_name,
                            last_name: registration.last_name,
                            email: registration.email
                        }
                    });
                });
            });
        });
    });
};

const getCheckinHistory = (workshop_id, queryParams) => {
    return new Promise((resolve, reject) => {
        const filters = { workshop_id: parseInt(workshop_id), ...queryParams };
        
        checkinModel.findAll(filters, (err, results) => {
            if (err) return reject(new AppError('Database error fetching checkins', 500));
            resolve(results);
        });
    });
};

module.exports = {
    processCheckin,
    getCheckinHistory
};
