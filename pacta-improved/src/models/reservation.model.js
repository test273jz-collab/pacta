const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tourist is required"],
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider is required"],
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Listing ID is required"],
      refPath: "listingModel",
    },
    listingModel: {
      type: String,
      required: [true, "Listing model type is required"],
      enum: ["Hotel", "Rental", "Resort", "Guide"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    startDate: {
  type: Date,
  required: [true, "Start date is required"],
  validate: {
    validator: function (value) {
      // Allow historical reservations
      if (
        this.status === "completed" ||
        this.status === "cancelled"
      ) {
        return true;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return value >= today;
    },
    message: "Start date cannot be in the past",
  },
},
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    currency: {
      type: String,
      default: "DZD",
      enum: ["DZD", "EUR", "USD"],
      uppercase: true,
    },
    guestCount: {
      type: Number,
      default: 1,
      min: [1, "At least 1 guest required"],
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, "Special requests cannot exceed 1000 characters"],
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
reservationSchema.index({ tourist: 1, status: 1, createdAt: -1 });
reservationSchema.index({ provider: 1, status: 1, createdAt: -1 });
reservationSchema.index({ listingId: 1, listingModel: 1 });
reservationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Reservation", reservationSchema);
