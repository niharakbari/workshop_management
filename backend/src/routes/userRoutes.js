const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// Only ADMIN can manage users
router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/", userController.getUsers);
router.patch("/:id/role", userController.updateUserRole);
router.delete("/:id", userController.deleteUser);

module.exports = router;
