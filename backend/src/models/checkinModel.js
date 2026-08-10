const db = require("../config/database");

const create = (registrationId, userId, callback) => {
    const sql = `
        INSERT INTO checkins (registration_id, checked_in_by, checked_in_at) 
        VALUES (?, ?, NOW())
    `;
    db.query(sql, [registrationId, userId], callback);
};

const findByRegistrationId = (registrationId, callback) => {
    db.query("SELECT * FROM checkins WHERE registration_id = ? LIMIT 1", [registrationId], callback);
};

const findAll = (filters, callback) => {
    let sql = `
        SELECT c.*, 
               r.registration_code,
               w.title as workshop_title,
               p.first_name, p.last_name, p.email, p.mobile,
               u.email as checker_email
        FROM checkins c
        JOIN registrations r ON c.registration_id = r.id
        JOIN workshops w ON r.workshop_id = w.id
        JOIN participants p ON r.participant_id = p.id
        LEFT JOIN users u ON c.checked_in_by = u.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.workshop_id) {
        sql += " AND r.workshop_id = ?";
        params.push(filters.workshop_id);
    }
    
    if (filters.search) {
        sql += " AND (r.registration_code LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR p.mobile LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY c.checked_in_at DESC";

    if (filters.limit && filters.offset !== undefined) {
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(filters.limit), parseInt(filters.offset));
    }

    db.query(sql, params, callback);
};

const deleteById = (id, callback) => {
    db.query("DELETE FROM checkins WHERE id = ?", [id], callback);
};

const updateCheckout = (id, callback) => {
    db.query("UPDATE checkins SET checked_out_at = NOW() WHERE id = ?", [id], callback);
};

const countAll = (filters, callback) => {
    let sql = `
        SELECT COUNT(c.id) as total
        FROM checkins c
        JOIN registrations r ON c.registration_id = r.id
        JOIN participants p ON r.participant_id = p.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.workshop_id) {
        sql += " AND r.workshop_id = ?";
        params.push(filters.workshop_id);
    }
    
    if (filters.search) {
        sql += " AND (r.registration_code LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR p.mobile LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    db.query(sql, params, callback);
};

module.exports = {
    create,
    findByRegistrationId,
    findAll,
    countAll,
    deleteById,
    updateCheckout
};
