const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  createReview,
  getListingReviews,
  getReviewSummary,
  voteHelpful,
  reportReview,
  respondToReview,
  adminGetAllReviews,
  adminModerateReview,
  deleteReview,
} = require("../controllers/review.controller");

// Public routes
router.get("/listing/:listingId/reviews", validatePagination, getListingReviews);
router.get("/listing/:listingId/summary", getReviewSummary);

// Protected routes
router.post("/", protect, createReview);
router.post("/:id/vote", protect, validateObjectId(), voteHelpful);
router.post("/:id/report", protect, validateObjectId(), reportReview);
router.post("/:id/respond", protect, validateObjectId(), respondToReview);
router.delete("/:id", protect, validateObjectId(), deleteReview);

// Admin routes
router.get("/admin/all", protect, restrictTo("admin"), validatePagination, adminGetAllReviews);
router.patch("/:id/moderate", protect, restrictTo("admin"), validateObjectId(), adminModerateReview);

module.exports = router;
