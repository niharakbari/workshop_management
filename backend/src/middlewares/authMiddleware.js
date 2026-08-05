const jwt = require("../utils/jwt");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const { decode } = require("jsonwebtoken");

const protect = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
        return next(new AppError("Unauthorized", 401));

    const token = authHeader.split(" ")[1];

    try {
        console.log(req.headers.authorization);

        console.log(token);

        const decoded = jwt.verifyAccessToken(token);

        console.log(decoded);

        userModel.findById(decoded.id, (err, rows) => {

            if (err)
                return next(err);

            if (rows.length === 0)
                return next(new AppError("User not found", 404));

            req.user = rows[0];

            next();

        });

    } catch(err) {

          console.log(err);
          next(new AppError("Invalid or expired token", 401));

    }

};

module.exports = {
    protect
};