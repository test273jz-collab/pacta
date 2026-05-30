const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { validateObjectId, validateDateRange, validatePagination } = require("../middlewares/validate.middleware");
const {
  createReservation,
  getMyReservations,
  getProviderReservations,
  updateReservationStatus,
  getReservationById,
  getAllReservations,
  deleteReservation,
} = require("../controllers/reservation.controller");

// Provider routes
router.get("/provider", protect, validatePagination, getProviderReservations);

// Admin routes
router.get("/admin/all", protect, adminOnly, validatePagination, getAllReservations);

// Tourist routes
router.post("/", protect, validateDateRange, createReservation);
router.get("/", protect, validatePagination, getMyReservations);

// Shared routes
router.get("/:id", protect, validateObjectId(), getReservationById);
router.patch("/:id/status", protect, validateObjectId(), updateReservationStatus);
router.delete("/:id", protect, validateObjectId(), deleteReservation);

module.exports = router;
