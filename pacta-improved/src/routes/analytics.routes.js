const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const {
  getOverview,
  getReservationStats,
  getRevenueStats,
  getTopPerformers,
  getUserGrowth,
  getReviewStats,
} = require("../controllers/analytics.controller");

router.get("/overview", protect, adminOnly, getOverview);
router.get("/reservations", protect, adminOnly, getReservationStats);
router.get("/revenue", protect, adminOnly, getRevenueStats);
router.get("/top-performers", protect, adminOnly, getTopPerformers);
router.get("/user-growth", protect, adminOnly, getUserGrowth);
router.get("/review-stats", protect, adminOnly, getReviewStats);

module.exports = router;
