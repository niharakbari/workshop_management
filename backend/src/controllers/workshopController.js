const workshopModel = require("../models/workshopModel");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");

exports.createWorkshop = (req, res, next) => {
    // 1. Assign the creator ID from the token (which is already verified by protect middleware)
    const workshopData = {
        ...req.body,
        created_by: req.user.id
    };

    // 2. Insert into database
    workshopModel.create(workshopData, (err, result) => {
        if (err) return next(err);

        res.status(201).json({
            success: true,
            message: "Workshop created successfully",
            data: { id: result.insertId }
        });
    });
};

exports.getAllWorkshops = (req, res, next) => {
    const filters = {
        status: req.query.status,
        search: req.query.search
    };

    workshopModel.findAll(filters, (err, rows) => {
        if (err) return next(err);

        res.status(200).json({
            success: true,
            results: rows.length,
            data: rows
        });
    });
};

exports.getWorkshopById = (req, res, next) => {
    workshopModel.findById(req.params.id, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return next(new AppError("Workshop not found", 404));
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    });
};

exports.updateWorkshop = (req, res, next) => {
    // 1. Verify existence
    workshopModel.findById(req.params.id, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return next(new AppError("Workshop not found", 404));
        }

        // 2. Perform Update
        workshopModel.update(req.params.id, req.body, (updateErr, result) => {
            if (updateErr) return next(updateErr);

            res.status(200).json({
                success: true,
                message: "Workshop updated successfully"
            });
        });
    });
};

exports.updateWorkshopStatus = (req, res, next) => {
    const { status } = req.body;
    
    if (!status) {
        return next(new AppError("Status is required", 400));
    }

    // 1. Verify existence
    workshopModel.findById(req.params.id, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return next(new AppError("Workshop not found", 404));
        }

        // 2. Perform Update
        workshopModel.updateStatus(req.params.id, status, (updateErr) => {
            if (updateErr) return next(updateErr);

            res.status(200).json({
                success: true,
                message: "Workshop status updated successfully"
            });
        });
    });
};

exports.uploadWorkshopBanner = (req, res, next) => {
    // 1. Ensure a file was actually uploaded by Multer
    if (!req.file) {
        return next(new AppError("Please upload an image file", 400));
    }

    const workshopId = req.params.id;
    // We only store the relative path in the DB so it's easy to serve
    const bannerPath = `/uploads/banners/${req.file.filename}`;

    // 2. Verify existence of the workshop and get the OLD banner to delete it safely
    workshopModel.findById(workshopId, (err, rows) => {
        if (err) {
            // If DB query fails, we must clean up the file we just uploaded!
            fs.unlink(req.file.path, () => {});
            return next(err);
        }

        if (rows.length === 0) {
            fs.unlink(req.file.path, () => {});
            return next(new AppError("Workshop not found", 404));
        }

        const oldBanner = rows[0].banner_image;

        // 3. Update the database with the new banner path
        workshopModel.updateBanner(workshopId, bannerPath, (updateErr) => {
            if (updateErr) {
                fs.unlink(req.file.path, () => {});
                return next(updateErr);
            }

            // 4. Safely delete the old banner from the filesystem if it exists
            if (oldBanner) {
                // Remove the leading slash to make it a relative path to the project root, or construct absolute
                const oldBannerAbsPath = path.join(__dirname, "../../", oldBanner);
                if (fs.existsSync(oldBannerAbsPath)) {
                    fs.unlink(oldBannerAbsPath, (unlinkErr) => {
                        if (unlinkErr) console.error("Failed to delete old banner:", unlinkErr);
                    });
                }
            }

            res.status(200).json({
                success: true,
                message: "Banner uploaded successfully",
                data: { banner_image: bannerPath }
            });
        });
    });
};

exports.deleteWorkshop = (req, res, next) => {
    workshopModel.findById(req.params.id, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return next(new AppError("Workshop not found", 404));
        }

        const oldBanner = rows[0].banner_image;

        workshopModel.deleteById(req.params.id, (deleteErr) => {
            if (deleteErr) return next(deleteErr);

            // Clean up the banner image if it exists when a workshop is deleted
            if (oldBanner) {
                const oldBannerAbsPath = path.join(__dirname, "../../", oldBanner);
                if (fs.existsSync(oldBannerAbsPath)) {
                    fs.unlink(oldBannerAbsPath, () => {});
                }
            }

            res.status(200).json({
                success: true,
                message: "Workshop deleted successfully"
            });
        });
    });
};
