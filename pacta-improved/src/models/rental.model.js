const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    type: {
      type: String,
      default: "rental",
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
    structure: {
      roomsCount: {
        type: Number,
        required: [true, "Room count is required"],
        min: [1, "At least 1 room"],
      },
      bedsCount: {
        type: Number,
        required: [true, "Bed count is required"],
        min: [1, "At least 1 bed"],
      },
      bathroomsCount: {
        type: Number,
        required: [true, "Bathroom count is required"],
        min: [1, "At least 1 bathroom"],
      },
      maxGuests: {
        type: Number,
        default: 2,
        min: [1, "At least 1 guest"],
      },
    },
    houseFeatures: {
      hasWiFi: { type: Boolean, default: false },
      hasAC: { type: Boolean, default: false },
      hasKitchen: { type: Boolean, default: false },
      hasPrivateEntrance: { type: Boolean, default: false },
      hasParking: { type: Boolean, default: false },
      hasWasher: { type: Boolean, default: false },
    },
    rentalRulesEn: {
      type: String,
      maxlength: [1000, "Rules cannot exceed 1000 characters"],
      default: "",
    },
    rentalRulesAr: {
      type: String,
      maxlength: [1000, "Rules cannot exceed 1000 characters"],
      default: "",
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

rentalSchema.index({ wilaya: 1, isActive: 1, rating: -1 });
rentalSchema.index({ pricePerNight: 1, isActive: 1 });
rentalSchema.index({ "structure.maxGuests": 1, isActive: 1 });
rentalSchema.index({ owner: 1, isActive: 1 });
rentalSchema.index({ titleEn: "text", titleAr: "text", descEn: "text" });

module.exports = mongoose.model("Rental", rentalSchema);
