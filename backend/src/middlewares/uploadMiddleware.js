const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

// Ensure the directory exists
const uploadDir = path.join(__dirname, "../../uploads/banners");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and a random string
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `banner-${uniqueSuffix}${ext}`);
    }
});

// File validation logic for images
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Not an image! Please upload only jpeg, png, or webp files.", 400), false);
    }
};

// File validation logic for CSV
const csvFileFilter = (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.mimetype === "application/csv" || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new AppError("Invalid file type! Please upload only CSV files.", 400), false);
    }
};

// Configure multer for images
const uploadImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Configure multer for CSV
const uploadCsv = multer({
    storage: storage,
    fileFilter: csvFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Middleware specifically for banner upload
const uploadBanner = uploadImage.single("banner");

// Middleware for CSV upload
const uploadParticipantsCSV = uploadCsv.single("file");

module.exports = {
    uploadBanner,
    uploadParticipantsCSV
};
