const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");

exports.getUsers = (req, res, next) => {
    const filters = {
        role: req.query.role,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
    };

    userModel.findAll(filters, (err, users) => {
        if (err) return next(err);

        // Omit passwords from the response
        const safeUsers = users.map(u => {
            const { password, ...safeUser } = u;
            return safeUser;
        });

        res.status(200).json({
            success: true,
            results: safeUsers.length,
            data: safeUsers
        });
    });
};

exports.updateUserRole = (req, res, next) => {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const requestingUserId = req.user.id;

    const validRoles = ['ADMIN', 'STAFF', 'VIEWER'];
    if (!validRoles.includes(role)) {
        return next(new AppError("Invalid role", 400));
    }

    // Rule 1: Cannot change own role
    if (targetUserId === requestingUserId) {
        return next(new AppError("You cannot change your own role", 403));
    }

    // 1. Verify user exists
    userModel.findById(targetUserId, (err, rows) => {
        if (err) return next(err);
        
        if (rows.length === 0) {
            return next(new AppError("User not found", 404));
        }

        const targetUser = rows[0];

        // If role is not changing, just return success
        if (targetUser.role === role) {
            return res.status(200).json({ success: true, message: "Role unchanged" });
        }

        // Rule 2: Cannot demote the last ADMIN
        if (targetUser.role === 'ADMIN') {
            userModel.countAdmins((countErr, adminCount) => {
                if (countErr) return next(countErr);
                
                if (adminCount <= 1) {
                    return next(new AppError("Cannot demote the last ADMIN in the system", 403));
                }
                
                proceedWithUpdate();
            });
        } else {
            proceedWithUpdate();
        }

        function proceedWithUpdate() {
            userModel.updateRole(targetUserId, role, (updateErr) => {
                if (updateErr) return next(updateErr);

                res.status(200).json({
                    success: true,
                    message: "User role updated successfully",
                    data: {
                        id: targetUser.id,
                        name: targetUser.name,
                        email: targetUser.email,
                        role: role
                    }
                });
            });
        }
    });
};

exports.deleteUser = (req, res, next) => {
    const targetUserId = parseInt(req.params.id, 10);
    const requestingUserId = req.user.id;

    // Cannot delete yourself
    if (targetUserId === requestingUserId) {
        return next(new AppError("You cannot delete your own account", 403));
    }

    userModel.findById(targetUserId, (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
            return next(new AppError("User not found", 404));
        }

        const targetUser = rows[0];

        // Rule 2: Cannot delete the last ADMIN
        if (targetUser.role === 'ADMIN') {
            userModel.countAdmins((countErr, adminCount) => {
                if (countErr) return next(countErr);
                
                if (adminCount <= 1) {
                    return next(new AppError("Cannot delete the last ADMIN in the system", 403));
                }
                
                proceedWithDelete();
            });
        } else {
            proceedWithDelete();
        }

        function proceedWithDelete() {
            userModel.deleteById(targetUserId, (deleteErr) => {
                // If a user has created workshops or checked in people, it will fail due to foreign key constraints,
                // unless ON DELETE CASCADE is set on the DB. If it fails due to foreign key, return nice error.
                if (deleteErr) {
                    if (deleteErr.code === 'ER_ROW_IS_REFERENCED_2') {
                        return next(new AppError("Cannot delete user because they are referenced by existing workshops or check-ins.", 400));
                    }
                    return next(deleteErr);
                }

                res.status(200).json({
                    success: true,
                    message: "User deleted successfully"
                });
            });
        }
    });
};
