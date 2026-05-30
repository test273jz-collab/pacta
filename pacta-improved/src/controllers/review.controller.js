const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Reservation = require("../models/reservation.model");
const Hotel = require("../models/hotel.model");
const Rental = require("../models/rental.model");
const Resort = require("../models/resort.model");
const Guide = require("../models/guide.model");
const Notification = require("../models/notification.model");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

const modelMap = {
  hotel: Hotel,
  rental: Rental,
  resort: Resort,
  guide: Guide,
};

// ==================== HELPER: Recalculate listing rating ====================
const recalculateListingRating = async (listingId, listingModel) => {
  try {
    const TargetModel = modelMap[listingModel.toLowerCase()];
    if (!TargetModel) return;

    const objectId = typeof listingId === "string" ? new mongoose.Types.ObjectId(listingId) : listingId;

    const stats = await Review.aggregate([
      { $match: { listingId: objectId, isApproved: true } },
      {
        $group: {
          _id: "$listingId",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating = stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 5.0;
    const reviewCount = stats.length > 0 ? stats[0].count : 0;

    await TargetModel.findByIdAndUpdate(listingId, { rating: averageRating, reviewCount });
  } catch (error) {
    console.error("Rating recalculation error:", error.message);
  }
};

// ==================== CREATE REVIEW ====================
exports.createReview = async (req, res, next) => {
  try {
    const { reservationId, rating, comment, media } = req.body;
    const touristId = req.user._id;

    if (!rating || !comment) {
      return next(new AppError("Rating and comment are required", 400));
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }

    if (comment.trim().length < 10) {
      return next(new AppError("Comment must be at least 10 characters", 400));
    }

    // Validate media array if provided
    if (media && (!Array.isArray(media) || media.length > 10)) {
      return next(new AppError("Media must be an array of up to 10 items", 400));
    }

    const booking = await Reservation.findOne({
      _id: reservationId,
      tourist: touristId,
      status: "completed",
    });

    if (!booking) {
      return next(new AppError("A completed reservation is required to post a review", 400));
    }

    const existingReview = await Review.findOne({ reservation: reservationId });
    if (existingReview) {
      return next(new AppError("You have already reviewed this booking", 409));
    }

    const review = await Review.create({
      tourist: touristId,
      reservation: reservationId,
      listingId: booking.listingId,
      listingModel: booking.listingModel,
      rating: numericRating,
      comment: comment.trim(),
      media: media || [],
      isVerifiedTrip: true,
    });

    await recalculateListingRating(booking.listingId, booking.listingModel);

    await Notification.create({
      recipient: booking.provider,
      type: "review_received",
      title: "New Review Received",
      message: `You received a ${numericRating}-star review`,
      data: { reviewId: review._id, listingId: booking.listingId },
    });

    sendSuccess(res, 201, "Review posted successfully", review);
  } catch (error) {
    next(error);
  }
};

// ==================== GET LISTING REVIEWS (Public) ====================
exports.getListingReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, minRating, maxRating, sortBy = "createdAt" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      listingId: new mongoose.Types.ObjectId(req.params.listingId),
      isApproved: true,
    };

    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (maxRating) filter.rating = { ...filter.rating, $lte: Number(maxRating) };

    const sortMap = {
      createdAt: { createdAt: -1 },
      rating: { rating: -1 },
      helpful: { helpfulCount: -1 },
    };
    const sort = sortMap[sortBy] || { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("tourist", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Reviews retrieved", reviews, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET REVIEW SUMMARY FOR LISTING ====================
exports.getReviewSummary = async (req, res, next) => {
  try {
    const summary = await Review.aggregate([
      { $match: { listingId: new mongoose.Types.ObjectId(req.params.listingId), isApproved: true } },
      {
        $group: {
          _id: "$listingId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: { $push: "$rating" },
          verifiedCount: { $sum: { $cond: ["$isVerifiedTrip", 1, 0] } },
        },
      },
    ]);

    if (summary.length === 0) {
      return sendSuccess(res, 200, "No reviews yet", {
        averageRating: 5.0,
        totalReviews: 0,
        verifiedCount: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    summary[0].ratingDistribution.forEach((r) => {
      distribution[r] = (distribution[r] || 0) + 1;
    });

    sendSuccess(res, 200, "Review summary retrieved", {
      averageRating: parseFloat(summary[0].averageRating.toFixed(1)),
      totalReviews: summary[0].totalReviews,
      verifiedCount: summary[0].verifiedCount,
      distribution,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== VOTE HELPFUL ====================
exports.voteHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError("Review not found", 404));

    const userId = req.user._id.toString();
    const alreadyVoted = review.helpfulVotes.map((v) => v.toString()).includes(userId);

    if (alreadyVoted) {
      review.helpfulVotes = review.helpfulVotes.filter((v) => v.toString() !== userId);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulVotes.push(req.user._id);
      review.helpfulCount += 1;
    }

    await review.save();

    sendSuccess(res, 200, alreadyVoted ? "Vote removed" : "Marked as helpful", {
      helpful: !alreadyVoted,
      helpfulCount: review.helpfulCount,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REPORT REVIEW ====================
exports.reportReview = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    if (!reason) return next(new AppError("Report reason is required", 400));

    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError("Review not found", 404));

    const alreadyReported = review.reports.some(
      (r) => r.reportedBy.toString() === req.user._id.toString()
    );
    if (alreadyReported) {
      return next(new AppError("You have already reported this review", 409));
    }

    review.reports.push({ reportedBy: req.user._id, reason, details });
    review.reportCount += 1;

    // Auto-flag if multiple reports
    if (review.reportCount >= 3) {
      review.isFlagged = true;
    }

    await review.save();

    sendSuccess(res, 200, "Review reported successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== PROVIDER RESPONSE ====================
exports.respondToReview = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 5) {
      return next(new AppError("Response must be at least 5 characters", 400));
    }

    const review = await Review.findById(req.params.id)
      .populate("reservation", "provider");

    if (!review) return next(new AppError("Review not found", 404));

    if (review.reservation?.provider?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("Only the provider or admin can respond to reviews", 403));
    }

    review.providerResponse = { text: text.trim(), respondedAt: new Date() };
    await review.save();

    sendSuccess(res, 200, "Response added successfully", review.providerResponse);
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN: GET ALL REVIEWS ====================
exports.adminGetAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isApproved, isFlagged, minReports } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";
    if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";
    if (minReports) filter.reportCount = { $gte: parseInt(minReports) };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("tourist", "name email avatar")
        .sort({ reportCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Reviews retrieved", reviews, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN: APPROVE / REJECT ====================
exports.adminModerateReview = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return next(new AppError("Action must be 'approve' or 'reject'", 400));
    }

    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError("Review not found", 404));

    review.isApproved = action === "approve";
    review.isFlagged = false;
    if (adminNote) review.adminNote = adminNote;

    await review.save();

    // Recalculate listing rating after moderation
    await recalculateListingRating(review.listingId, review.listingModel);

    sendSuccess(res, 200, `Review ${action}d successfully`, { isApproved: review.isApproved });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE REVIEW ====================
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError("Review not found", 404));

    if (review.tourist.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("Not authorized to delete this review", 403));
    }

    const { listingId, listingModel } = review;
    await review.deleteOne();
    await recalculateListingRating(listingId, listingModel);

    sendSuccess(res, 200, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};
