const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tourist is required"],
      index: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: [true, "Reservation reference is required"],
      unique: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Listing ID is required"],
      index: true,
    },
    listingModel: {
      type: String,
      required: [true, "Listing model type is required"],
      enum: ["Hotel", "Rental", "Resort", "Guide"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    // Media attachments
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], default: "image" },
        publicId: { type: String },
      },
    ],
    // Helpful votes
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    // Reports
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, enum: ["spam", "offensive", "fake", "other"], required: true },
        details: { type: String, maxlength: 300 },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    reportCount: {
      type: Number,
      default: 0,
    },
    // Moderation
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    adminNote: {
      type: String,
      maxlength: 500,
    },
    // Verification
    isVerifiedTrip: {
      type: Boolean,
      default: true,
    },
    // Provider response
    providerResponse: {
      text: { type: String, maxlength: 800 },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per reservation
reviewSchema.index({ tourist: 1, reservation: 1 }, { unique: true });
reviewSchema.index({ listingId: 1, listingModel: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isFlagged: 1, reportCount: -1 });

module.exports = mongoose.model("Review", reviewSchema);
