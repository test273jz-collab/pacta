const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  submitContact,
  getAllMessages,
  getMessageById,
  replyToMessage,
  deleteMessage,
} = require("../controllers/contact.controller");

// Public route
router.post("/", submitContact);

// Admin routes
router.get("/", protect, adminOnly, validatePagination, getAllMessages);
router.get("/:id", protect, adminOnly, validateObjectId(), getMessageById);
router.post("/:id/reply", protect, adminOnly, validateObjectId(), replyToMessage);
router.delete("/:id", protect, adminOnly, validateObjectId(), deleteMessage);

module.exports = router;
