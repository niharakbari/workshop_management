const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");

// The asyncHandler (if you have one, or just standard try/catch if not)
// Looking at your previous files, you might have one. I'll write this with standard promises to be safe and wrap in try/catch or assume standard callback.
// Since userModel uses callbacks (as seen in userModel.js), I'll stick to that pattern.

exports.promoteToStaff = (req, res, next) => {
    const userId = req.params.id;

    // 1. Verify user exists
    userModel.findById(userId, (err, rows) => {
        if (err) return next(err);
        
        if (rows.length === 0) {
            return next(new AppError("User not found", 404));
        }

        const user = rows[0];

        // 2. Business Logic: Only VIEWER can be promoted to STAFF
        if (user.role !== 'VIEWER') {
            return next(new AppError(`Cannot promote user with role ${user.role}. Only VIEWERs can be promoted.`, 400));
        }

        // 3. Update the role
        userModel.updateRole(userId, 'STAFF', (updateErr) => {
            if (updateErr) return next(updateErr);

            res.status(200).json({
                success: true,
                message: "User successfully promoted to STAFF",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: 'STAFF'
                }
            });
        });
    });
};
