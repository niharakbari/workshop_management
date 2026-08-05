const authService = require("../services/authService");

const cookieOptions = require("../utils/cookieOptions");

const logger = require("../config/logger");

const asyncHandler = require("../utils/asyncHandler");

const AppError = require("../utils/AppError");

const registerUser = asyncHandler(async (req, res) => {

    await authService.registerUser(req.body);

    logger.info(`User Registered : ${req.body.email}`);

    return res.status(201).json({
        success: true,
        message: "User registered successfully"
    });

});



module.exports = {
    registerUser,
   
};