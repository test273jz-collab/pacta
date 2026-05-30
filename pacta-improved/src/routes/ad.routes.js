const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { upload } = require("../config/multer");
const { handleUploadError } = require("../config/multer");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  getAds,
  createAd,
  updateAd,
  deleteAd,
  getAdById,
} = require("../controllers/ad.controller");

// Public routes
router.get("/", validatePagination, getAds);
router.get("/:id", validateObjectId(), getAdById);

// Admin only routes
router.post("/", protect, adminOnly, upload.single("image"), handleUploadError, createAd);
router.put("/:id", protect, adminOnly, validateObjectId(), upload.single("image"), handleUploadError, updateAd);
router.delete("/:id", protect, adminOnly, validateObjectId(), deleteAd);

module.exports = router;
