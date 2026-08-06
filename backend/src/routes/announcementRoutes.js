const express = require("express");
const announcementController = require("../controllers/announcementController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { validateAnnouncement, validateAnnouncementUpdate } = require("../validations/announcementValidation");
const validationMiddleware = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(protect);

// GET routes are accessible by VIEWER, STAFF, ADMIN
router.get("/", announcementController.getAllAnnouncements);
router.get("/:id", announcementController.getAnnouncementById);

// All other routes restricted to ADMIN
router.use(restrictTo("ADMIN"));

router.post(
    "/",
    validateAnnouncement,
    validationMiddleware,
    announcementController.createAnnouncement
);

router.patch(
    "/:id",
    validateAnnouncementUpdate,
    validationMiddleware,
    announcementController.updateAnnouncement
);

router.delete("/:id", announcementController.deleteAnnouncement);

module.exports = router;
