const db = require("../config/database");

const create = (workshop, callback) => {
    const sql = `
        INSERT INTO workshops (
            title, description, venue, start_datetime, end_datetime,
            registration_start, registration_end, capacity, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        workshop.title,
        workshop.description || null,
        workshop.venue,
        workshop.start_datetime,
        workshop.end_datetime,
        workshop.registration_start || null,
        workshop.registration_end || null,
        workshop.capacity,
        workshop.created_by
    ], callback);
};

const findById = (id, callback) => {
    db.query("SELECT * FROM workshops WHERE id = ? LIMIT 1", [id], callback);
};

const findAll = (filters, callback) => {
    let sql = "SELECT * FROM workshops WHERE 1=1";
    const params = [];

    if (filters.status) {
        sql += " AND status = ?";
        params.push(filters.status);
    }

    if (filters.search) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY start_datetime DESC";

    db.query(sql, params, callback);
};

const update = (id, updates, callback) => {
    // Only update fields that were provided
    const fields = [];
    const values = [];

    const allowedFields = [
        'title', 'description', 'venue', 'start_datetime', 'end_datetime',
        'registration_start', 'registration_end', 'capacity', 'status', 'banner_image'
    ];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    });

    if (fields.length === 0) {
        return callback(null, { affectedRows: 0 }); // Nothing to update
    }

    const sql = `UPDATE workshops SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    db.query(sql, values, callback);
};

const updateStatus = (id, status, callback) => {
    db.query("UPDATE workshops SET status = ? WHERE id = ?", [status, id], callback);
};

const updateBanner = (id, bannerPath, callback) => {
    db.query("UPDATE workshops SET banner_image = ? WHERE id = ?", [bannerPath, id], callback);
};

const deleteById = (id, callback) => {
    db.query("DELETE FROM workshops WHERE id = ?", [id], callback);
};

module.exports = {
    create,
    findById,
    findAll,
    update,
    updateStatus,
    updateBanner,
    deleteById
};
