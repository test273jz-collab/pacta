const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  createResort,
  getResorts,
  getResortById,
  updateResort,
  deleteResort,
  toggleResortStatus,
  getMyResorts,
} = require("../controllers/resort.controller");

// Public routes
router.get("/", validatePagination, getResorts);
router.get("/:id", validateObjectId(), getResortById);

// Protected provider routes
router.post("/", protect, createResort);
router.get("/my/listings", protect, getMyResorts);
router.put("/:id", protect, validateObjectId(), updateResort);
router.delete("/:id", protect, validateObjectId(), deleteResort);
router.patch("/:id/toggle", protect, validateObjectId(), toggleResortStatus);

module.exports = router;
