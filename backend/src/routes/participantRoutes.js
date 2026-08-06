const express = require("express");
const participantController = require("../controllers/participantController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { validateParticipant } = require("../validations/participantValidation");
const validationMiddleware = require("../middlewares/validationMiddleware");
const { uploadParticipantsCSV } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.use(protect);

// Read-only accessible by VIEWER, STAFF, ADMIN
router.get("/", participantController.getAllParticipants);
router.get("/:id", participantController.getParticipantById);

// Write operations restricted to ADMIN
router.use(restrictTo("ADMIN"));

router.post(
    "/",
    validateParticipant,
    validationMiddleware,
    participantController.createParticipant
);

router.post(
    "/import",
    uploadParticipantsCSV,
    participantController.importParticipants
);

router.patch(
    "/:id",
    validateParticipant,
    validationMiddleware,
    participantController.updateParticipant
);

router.delete("/:id", participantController.deleteParticipant);

module.exports = router;
