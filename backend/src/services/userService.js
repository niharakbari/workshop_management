const userModel = require("../models/userModel");

const AppError = require("../utils/AppError");

const getUsers = async () => {

    return new Promise((resolve, reject) => {

        userModel.findAll((err, rows) => {

            if (err)
                return reject(err);

            resolve(rows);

        });

    });

};

const deleteUserAccount = async (userId) => {

    return new Promise((resolve, reject) => {

        userModel.deleteById(userId, (err, result) => {

            if (err)
                return reject(err);

            if (result.affectedRows === 0)
                return reject(new AppError("User not found", 404));

            resolve();

        });

    });

};

module.exports = {
    getUsers,
    deleteUserAccount
};