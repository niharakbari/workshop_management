const db = require("../config/database");

const create = (announcement, callback) => {
    const sql = `
        INSERT INTO announcements (workshop_id, title, message, created_by) 
        VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [
        announcement.workshop_id,
        announcement.title,
        announcement.message,
        announcement.created_by
    ], callback);
};

const findById = (id, callback) => {
    db.query("SELECT * FROM announcements WHERE id = ? LIMIT 1", [id], callback);
};

const findAll = (filters, callback) => {
    let sql = "SELECT * FROM announcements WHERE 1=1";
    const params = [];

    if (filters.workshop_id) {
        sql += " AND workshop_id = ?";
        params.push(filters.workshop_id);
    }

    sql += " ORDER BY created_at DESC";

    db.query(sql, params, callback);
};

const update = (id, updates, callback) => {
    const fields = [];
    const values = [];
    
    const allowedFields = ['title', 'message'];
    
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    });

    if (fields.length === 0) return callback(null, { affectedRows: 0 });

    const sql = `UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
};

const deleteById = (id, callback) => {
    db.query("DELETE FROM announcements WHERE id = ?", [id], callback);
};

module.exports = {
    create,
    findById,
    findAll,
    update,
    deleteById
};
