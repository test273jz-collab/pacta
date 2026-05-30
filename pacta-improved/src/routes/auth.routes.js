const express = require("express");
const router = express.Router();
const {
  login,
  register,
  registerComplete,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  updateProviderApproval,
} = require("../controllers/auth.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { authLimiter, registerLimiter } = require("../middlewares/rateLimit.middleware");

// Public routes
router.post("/login", authLimiter, login);
router.post("/register", registerLimiter, register);
router.post("/register-complete", registerLimiter, registerComplete);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Admin only routes
router.get("/users", protect, adminOnly, getAllUsers);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);
router.patch("/users/:id/toggle", protect, adminOnly, toggleUserStatus);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.patch("/users/:id/approval", protect, adminOnly, updateProviderApproval);

module.exports = router;
