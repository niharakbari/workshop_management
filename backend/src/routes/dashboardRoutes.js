const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Ensure user is logged in
router.get('/stats', dashboardController.getStats);

module.exports = router;
