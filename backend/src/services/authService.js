const bcrypt = require("bcrypt");

const config = require("../config/config");

const userModel = require("../models/userModel");

const refreshTokenModel = require("../models/refreshTokenModel");

const jwt = require("../utils/jwt");

const AppError = require("../utils/AppError");

const logger = require("../config/logger");




//        ----------register user--------------

const registerUser = async (user) => {


    const hashedPassword = await bcrypt.hash(
        user.password,
        Number(config.bcryptSaltRounds)
    );

    user.password_hash = hashedPassword;

    delete user.password;

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




module.exports = {
    registerUser,

};

