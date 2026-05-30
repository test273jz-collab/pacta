const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { validateObjectId } = require("../middlewares/validate.middleware");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, validateObjectId(), markAsRead);
router.delete("/:id", protect, validateObjectId(), deleteNotification);

module.exports = router;
