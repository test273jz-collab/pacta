const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    type: {
      type: String,
      default: "hotel",
      immutable: true,
    },
     category: {
          type: String,
        
          
        },
    titleEn: {
      type: String,
      required: [true, "English title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    titleAr: {
      type: String,
      required: [true, "Arabic title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    descEn: {
      type: String,
      required: [true, "English description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    descAr: {
      type: String,
      required: [true, "Arabic description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    roomsAvailable: {
      type: Number,
      required: [true, "Number of available rooms is required"],
      min: [1, "At least 1 room must be available"],
      default: 1,
    },
    amenities: {
      hasPool: { type: Boolean, default: false },
      hasSpa: { type: Boolean, default: false },
      hasGym: { type: Boolean, default: false },
      hasFreeParking: { type: Boolean, default: false },
      hasRestaurant: { type: Boolean, default: false },
      breakfastIncluded: { type: Boolean, default: false },
      hasWiFi: { type: Boolean, default: false },
      hasAC: { type: Boolean, default: false },
    },
    propertyClass: {
      type: Number,
      default: 3,
      min: [1, "Minimum class is 1 star"],
      max: [5, "Maximum class is 5 stars"],
    },
       images: [{ type: String }],

    wilaya: {
      type: String,
      required: [true, "Wilaya (state/province) is required"],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common query patterns
hotelSchema.index({ wilaya: 1, isActive: 1, rating: -1 });
hotelSchema.index({ pricePerNight: 1, isActive: 1 });
hotelSchema.index({ propertyClass: 1, isActive: 1 });
hotelSchema.index({ owner: 1, isActive: 1 });
hotelSchema.index({ titleEn: "text", titleAr: "text", descEn: "text" });

module.exports = mongoose.model("Hotel", hotelSchema);
