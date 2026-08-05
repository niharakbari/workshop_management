const db = require("../config/database");

const saveRefreshToken = (
    userId,
    refreshToken,
    expiresAt,
    callback
) => {

    db.query(
        `
        INSERT INTO refresh_tokens
        (
            user_id,
            refresh_token,
            expires_at
        )
        VALUES (?, ?, ?)
        `,
        [
            userId,
            refreshToken,
            expiresAt
        ],
        callback
    );

};

const findRefreshToken = (refreshToken, callback) => {

    db.query(
        `
        SELECT *
        FROM refresh_tokens
        WHERE refresh_token = ?
        LIMIT 1
        `,
        [refreshToken],
        callback
    );

};

const deleteRefreshToken = (refreshToken, callback) => {

    db.query(
        `
        DELETE FROM refresh_tokens
        WHERE refresh_token = ?
        `,
        [refreshToken],
        callback
    );

};

const deleteUserRefreshTokens = (userId, callback) => {

    db.query(
        `
        DELETE FROM refresh_tokens
        WHERE user_id = ?
        `,
        [userId],
        callback
    );

};

module.exports = {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteUserRefreshTokens
};
