const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Listing ID is required"],
    },
    listingModel: {
      type: String,
      required: [true, "Listing model type is required"],
      enum: ["Hotel", "Rental", "Resort", "Guide"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate wishlist entries
wishlistSchema.index({ user: 1, listingId: 1, listingModel: 1 }, { unique: true });
wishlistSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);
