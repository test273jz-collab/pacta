const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { upload } = require("../config/multer");
const { handleUploadError } = require("../config/multer");
const { validateObjectId } = require("../middlewares/validate.middleware");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
} = require("../controllers/category.controller");

// Public routes
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);

// Admin only routes
router.post("/", protect, adminOnly, upload.single("image"), handleUploadError, createCategory);
router.put("/:id", protect, adminOnly, validateObjectId(), upload.single("image"), handleUploadError, updateCategory);
router.delete("/:id", protect, adminOnly, validateObjectId(), deleteCategory);

module.exports = router;
