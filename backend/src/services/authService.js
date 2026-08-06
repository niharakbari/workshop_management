const bcrypt = require("bcrypt");

const config = require("../config/config");

const userModel = require("../models/userModel");
const refreshTokenModel = require("../models/refreshTokenModel");

const jwt = require("../utils/jwt");

const AppError = require("../utils/AppError");

const logger = require("../config/logger");




const registerUser = async (user) => {

    const hashedPassword = await bcrypt.hash(
        user.password,
        Number(config.bcryptSaltRounds)
    );

    user.password = hashedPassword;

    return new Promise((resolve, reject) => {

        userModel.register(user, (err) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return reject(new AppError("Email already registered", 409));
                };

                return reject(err);

            };

            resolve();

        });

    });

};




//        ----------login user--------------

const loginUser = async (email, password) => {
    return new Promise((resolve, reject) => {
        userModel.findByEmail(email, async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Invalid email or password", 401));

            const user = rows[0];

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) return reject(new AppError("Invalid email or password", 401));

            const accessToken = jwt.generateAccessToken(user);
            const refreshToken = jwt.generateRefreshToken(user);
            const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiryMs);

            refreshTokenModel.saveRefreshToken(user.id, refreshToken, expiresAt, (saveErr) => {
                if (saveErr) return reject(saveErr);
                resolve({ accessToken, refreshToken, user });
            });
        });
    });
};

const refreshToken = async (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject(new AppError("Refresh token is required", 400));
        }

        let decoded;
        try {
            decoded = jwt.verifyRefreshToken(token);
        } catch (err) {
            return reject(new AppError("Invalid or expired refresh token", 401));
        }

        refreshTokenModel.findRefreshToken(token, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                return reject(new AppError("Invalid or expired refresh token", 401));
            }

            const dbToken = rows[0];
            const now = new Date();
            if (new Date(dbToken.expires_at) < now) {
                refreshTokenModel.deleteRefreshToken(token, () => {});
                return reject(new AppError("Refresh token expired", 401));
            }

            userModel.findById(decoded.id, (err, userRows) => {
                if (err) return reject(err);
                if (userRows.length === 0) {
                    return reject(new AppError("User not found", 404));
                }

                const user = userRows[0];
                const newAccessToken = jwt.generateAccessToken(user);
                const newRefreshToken = jwt.generateRefreshToken(user);
                const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiryMs);

                refreshTokenModel.deleteRefreshToken(token, (deleteErr) => {
                    if (deleteErr) return reject(deleteErr);

                    refreshTokenModel.saveRefreshToken(user.id, newRefreshToken, expiresAt, (saveErr) => {
                        if (saveErr) return reject(saveErr);
                        resolve({
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                            user
                        });
                    });
                });
            });
        });
    });
};

const logoutUser = async (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return resolve();
        }
        refreshTokenModel.deleteRefreshToken(token, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
};
