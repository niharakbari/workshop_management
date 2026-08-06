const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// Only ADMIN can promote users
router.patch(
    "/:id/promote",
    protect,
    restrictTo("ADMIN"),
    userController.promoteToStaff
);

module.exports = router;
