const db = require("../config/database");

const register = (user, callback) => {

    const sql = `
        INSERT INTO users
        (
            username,
            first_name,
            last_name,
            email,
            mobile_number,
            date_of_birth,
            password_hash
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user.name,
            user.email,
            user.password_hash,
            user.email,
            user.role,
    
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
            username,
            first_name,
            last_name,
            email,
            mobile_number,
            date_of_birth,
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
            username,
            first_name,
            last_name,
            email,
            mobile_number,
            date_of_birth,
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