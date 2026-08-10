const db = require("../config/database");

const create = (participant, connection = db, callback) => {
    if (typeof connection === 'function') {
        callback = connection;
        connection = db;
    }
    const sql = `
        INSERT INTO participants (first_name, last_name, email, mobile, organization) 
        VALUES (?, ?, ?, ?, ?)
    `;
    connection.query(sql, [
        participant.first_name, 
        participant.last_name || null, 
        participant.email, 
        participant.mobile, 
        participant.organization || null
    ], callback);
};

const findById = (id, callback) => {
    db.query("SELECT * FROM participants WHERE id = ? LIMIT 1", [id], callback);
};

const findByEmailOrMobile = (email, mobile, connection = db, callback) => {
    if (typeof connection === 'function') {
        callback = connection;
        connection = db;
    }
    connection.query(
        "SELECT * FROM participants WHERE email = ? OR mobile = ? LIMIT 1", 
        [email, mobile], 
        callback
    );
};

const findAll = (filters, callback) => {
    let sql = "SELECT * FROM participants WHERE 1=1";
    const params = [];

    if (filters.search) {
        sql += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.workshop_id) {
        // Find participants who have a registration for this workshop
        sql += " AND id IN (SELECT participant_id FROM registrations WHERE workshop_id = ?)";
        params.push(filters.workshop_id);
    }

    sql += " ORDER BY created_at DESC";

    if (filters.limit && filters.offset !== undefined) {
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(filters.limit), parseInt(filters.offset));
    }

    db.query(sql, params, callback);
};

const update = (id, updates, callback) => {
    const fields = [];
    const values = [];
    
    const allowedFields = ['first_name', 'last_name', 'email', 'mobile', 'organization'];
    
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    });

    if (fields.length === 0) return callback(null, { affectedRows: 0 });

    const sql = `UPDATE participants SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
};

const deleteById = (id, callback) => {
    db.query("DELETE FROM participants WHERE id = ?", [id], callback);
};

module.exports = {
    create,
    findById,
    findByEmailOrMobile,
    findAll,
    update,
    deleteById
};
