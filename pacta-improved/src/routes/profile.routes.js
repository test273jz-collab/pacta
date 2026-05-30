const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { upload } = require("../config/multer");
const { handleUploadError } = require("../config/multer");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profile.controller");

router.get("/", protect, getProfile);
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  handleUploadError,
  updateProfile
);
router.put("/change-password", protect, changePassword);

module.exports = router;
