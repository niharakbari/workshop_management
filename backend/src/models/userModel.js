const db = require("../config/database");

const register = (user, callback) => {

    const sql = `
        INSERT INTO users
        (
            name,
            email,
            password,
            role
        )
        VALUES (?, ?, ?, 'VIEWER')
    `;

    // Notice we ignore user.role and hardcode 'VIEWER' to prevent privilege escalation!
    db.query(
        sql,
        [
            user.name,
            user.email,
            user.password
        ],
        callback
    );

};

const updateRole = (id, newRole, callback) => {
    db.query(
        "UPDATE users SET role = ? WHERE id = ?",
        [newRole, id],
        callback
    );
};

const findByEmail = (email, callback) => {

    db.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email],
        callback
    );

};

const findById = (id, callback) => {

    db.query(
        `
        SELECT
            id,
            name,
            email,
            password,
            role,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id],
        callback
    );

};

const findAll = (callback) => {

    db.query(
        `
        SELECT
            id,
            name,
            email,
            password,
            role,
            created_at,
            updated_at
        FROM users
        ORDER BY id ASC
        `,
        callback
    );

};

const deleteById = (id, callback) => {

    db.query(
        "DELETE FROM users WHERE id = ?",
        [id],
        callback
    );

};

module.exports = {
    register,
    updateRole,
    findByEmail,
    findById,
    findAll,
    deleteById
};