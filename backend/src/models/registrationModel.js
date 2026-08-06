const db = require("../config/database");

const create = (registration, callback) => {
    const sql = `
        INSERT INTO registrations (participant_id, workshop_id, registration_code, status) 
        VALUES (?, ?, ?, 'REGISTERED')
    `;
    db.query(sql, [
        registration.participant_id, 
        registration.workshop_id, 
        registration.registration_code
    ], callback);
};

const checkDuplicate = (participant_id, workshop_id, callback) => {
    const sql = "SELECT id FROM registrations WHERE participant_id = ? AND workshop_id = ? LIMIT 1";
    db.query(sql, [participant_id, workshop_id], callback);
};

const findById = (id, callback) => {
    db.query("SELECT * FROM registrations WHERE id = ? LIMIT 1", [id], callback);
};

const findAll = (filters, callback) => {
    let sql = "SELECT * FROM registrations WHERE 1=1";
    const params = [];

    if (filters.workshop_id) {
        sql += " AND workshop_id = ?";
        params.push(filters.workshop_id);
    }
    
    if (filters.status) {
        sql += " AND status = ?";
        params.push(filters.status);
    }

    sql += " ORDER BY registered_at DESC";

    db.query(sql, params, callback);
};

const updateStatus = (id, status, callback) => {
    db.query("UPDATE registrations SET status = ? WHERE id = ?", [status, id], callback);
};

const deleteById = (id, callback) => {
    db.query("DELETE FROM registrations WHERE id = ?", [id], callback);
};

module.exports = {
    create,
    checkDuplicate,
    findById,
    findAll,
    updateStatus,
    deleteById
};
