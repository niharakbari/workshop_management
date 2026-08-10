const express = require("express");
const reportController = require("../controllers/reportController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("ADMIN", "STAFF"));

router.get("/participants/export", reportController.exportParticipants);
router.get("/registrations/export", reportController.exportRegistrations);
router.get("/checkins/export", reportController.exportCheckins);

module.exports = router;
