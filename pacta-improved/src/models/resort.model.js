const mongoose = require("mongoose");

const resortSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    type: {
      type: String,
      default: "resort",
      immutable: true,
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
    leisureActivities: {
      hasPrivateBeach: { type: Boolean, default: false },
      hasWaterpark: { type: Boolean, default: false },
      hasClub: { type: Boolean, default: false },
      hasSportsCourts: { type: Boolean, default: false },
      hasPool: { type: Boolean, default: false },
      hasSpa: { type: Boolean, default: false },
      hasKidsClub: { type: Boolean, default: false },
    },
    category: {
          type: String,
        
          
        },
    maxCapacity: {
      type: Number,
      default: 2,
      min: [1, "At least 1 guest"],
    },
     images: [{ type: String }],
    wilaya: {
      type: String,
      required: [true, "Wilaya is required"],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      set: (val) => Math.round(val * 10) / 10,
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

resortSchema.index({ wilaya: 1, isActive: 1, rating: -1 });
resortSchema.index({ pricePerNight: 1, isActive: 1 });
resortSchema.index({ maxCapacity: 1, isActive: 1 });
resortSchema.index({ owner: 1, isActive: 1 });
resortSchema.index({ titleEn: "text", titleAr: "text", descEn: "text" });

module.exports = mongoose.model("Resort", resortSchema);
