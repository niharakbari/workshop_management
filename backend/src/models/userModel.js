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
        VALUES (?, ?, ?, COALESCE(?, 'user'))
    `;

    db.query(
        sql,
        [
            user.name,
            user.email,
            user.password,
            user.role
        ],
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
    findByEmail,
    findById,
    findAll,
    deleteById
};