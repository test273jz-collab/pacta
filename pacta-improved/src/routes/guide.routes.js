const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  createGuide,
  getGuides,
  getGuideById,
  updateGuide,
  deleteGuide,
  toggleGuideStatus,
  getMyGuide,
} = require("../controllers/guide.controller");

// Public routes
router.get("/", validatePagination, getGuides);
router.get("/:id", validateObjectId(), getGuideById);

// Protected provider routes
router.post("/", protect, createGuide);
router.get("/my/profile", protect, getMyGuide);
router.put("/:id", protect, validateObjectId(), updateGuide);
router.delete("/:id", protect, validateObjectId(), deleteGuide);
router.patch("/:id/toggle", protect, validateObjectId(), toggleGuideStatus);

module.exports = router;
