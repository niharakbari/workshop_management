const express = require("express");
const router = express.Router();
const checkinController = require("../controllers/checkinController");
const authMiddleware = require("../middlewares/authMiddleware");

// All routes require authentication
router.use(authMiddleware.protect);

router.post("/", checkinController.checkIn);
router.get("/", checkinController.getCheckIns);

module.exports = router;
