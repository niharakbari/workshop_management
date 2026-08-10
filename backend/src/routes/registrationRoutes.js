const express = require("express");
const registrationController = require("../controllers/registrationController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { validateRegistration, validateRegistrationStatus } = require("../validations/registrationValidation");
const validationMiddleware = require("../middlewares/validationMiddleware");

const router = express.Router();

router.use(protect);

// GET routes are accessible by VIEWER, STAFF, ADMIN
router.get("/", registrationController.getAllRegistrations);
router.get("/:id", registrationController.getRegistrationById);

// All other routes restricted to ADMIN and STAFF
router.use(restrictTo("ADMIN", "STAFF"));

router.post(
    "/",
    validateRegistration,
    validationMiddleware,
    registrationController.createRegistration
);

router.patch(
    "/:id/status",
    validateRegistrationStatus,
    validationMiddleware,
    registrationController.updateRegistrationStatus
);

// Dedicated route for cancellation
router.patch("/:id/cancel", registrationController.cancelRegistration);

router.delete("/:id", registrationController.deleteRegistration);

module.exports = router;
