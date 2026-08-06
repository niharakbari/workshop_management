const express = require("express");
const workshopController = require("../controllers/workshopController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { validateWorkshop, validateWorkshopStatus } = require("../validations/workshopValidation");
const validationMiddleware = require("../middlewares/validationMiddleware");
const { uploadBanner } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Publicly readable or Viewer readable? The instructions say: "VIEWER: Read-only". So we protect all routes.
router.use(protect);

// GET routes (Accessible to VIEWER, STAFF, ADMIN - basically anyone with a valid token)
router.get("/", workshopController.getAllWorkshops);
router.get("/:id", workshopController.getWorkshopById);

// All subsequent routes modify data, so we restrict them to ADMIN only
router.use(restrictTo("ADMIN"));

router.post(
    "/",
    validateWorkshop,
    validationMiddleware,
    workshopController.createWorkshop
);

router.patch(
    "/:id",
    validateWorkshop,
    validationMiddleware,
    workshopController.updateWorkshop
);

router.patch(
    "/:id/status",
    validateWorkshopStatus,
    validationMiddleware,
    workshopController.updateWorkshopStatus
);

router.patch(
    "/:id/banner",
    uploadBanner,
    workshopController.uploadWorkshopBanner
);

router.delete("/:id", workshopController.deleteWorkshop);

module.exports = router;
