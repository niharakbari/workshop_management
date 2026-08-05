const bcrypt = require("bcrypt");

const config = require("../config/config");

const userModel = require("../models/userModel");

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

            resolve({ accessToken, user });
        });
    });
};

module.exports = {
    registerUser,
    loginUser
};
