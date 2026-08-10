const db = require("../config/database");

const create = (registration, connection = db, callback) => {
    if (typeof connection === 'function') {
        callback = connection;
        connection = db;
    }
    const sql = `
        INSERT INTO registrations (participant_id, workshop_id, registration_code, status) 
        SELECT ?, ?, ?, 'REGISTERED' FROM DUAL
        WHERE (SELECT COUNT(*) FROM registrations WHERE workshop_id = ? AND status != 'CANCELLED') < (SELECT capacity FROM workshops WHERE id = ?)
    `;
    connection.query(sql, [
        registration.participant_id, 
        registration.workshop_id, 
        registration.registration_code,
        registration.workshop_id,
        registration.workshop_id
    ], callback);
};

const checkDuplicate = (participant_id, workshop_id, connection = db, callback) => {
    if (typeof connection === 'function') {
        callback = connection;
        connection = db;
    }
    const sql = "SELECT id FROM registrations WHERE participant_id = ? AND workshop_id = ? LIMIT 1";
    connection.query(sql, [participant_id, workshop_id], callback);
};

const findById = (id, callback) => {
    db.query("SELECT * FROM registrations WHERE id = ? LIMIT 1", [id], callback);
};

const findByCode = (code, callback) => {
    db.query(`
        SELECT r.*, 
               p.first_name, p.last_name, p.email, p.mobile,
               w.start_datetime, w.end_datetime
        FROM registrations r
        JOIN participants p ON r.participant_id = p.id
        JOIN workshops w ON r.workshop_id = w.id
        WHERE r.registration_code = ? LIMIT 1
    `, [code], callback);
};

const findAll = (filters, callback) => {
    let sql = `
        SELECT r.*, 
               w.title as workshop_title, 
               p.first_name, p.last_name, p.email, p.mobile 
        FROM registrations r
        LEFT JOIN workshops w ON r.workshop_id = w.id
        LEFT JOIN participants p ON r.participant_id = p.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.workshop_id) {
        sql += " AND r.workshop_id = ?";
        params.push(filters.workshop_id);
    }
    
    if (filters.status) {
        sql += " AND r.status = ?";
        params.push(filters.status);
    }
    
    if (filters.participant_id) {
        sql += " AND r.participant_id = ?";
        params.push(filters.participant_id);
    }
    
    if (filters.search) {
        sql += " AND (r.registration_code LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR p.mobile LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY r.registered_at DESC";

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
    findByCode,
    findAll,
    updateStatus,
    deleteById
};
