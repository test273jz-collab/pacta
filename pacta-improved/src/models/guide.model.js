const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    type: {
      type: String,
      default: "guide",
      immutable: true,
    },
    category: {
          type: String,
        
          
        },
    nameEn: {
      type: String,
      required: [true, "English name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    nameAr: {
      type: String,
      required: [true, "Arabic name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    expertiseEn: {
      type: String,
      required: [true, "English expertise description is required"],
      trim: true,
      maxlength: [1000, "Expertise description cannot exceed 1000 characters"],
    },
    expertiseAr: {
      type: String,
      required: [true, "Arabic expertise description is required"],
      trim: true,
      maxlength: [1000, "Expertise description cannot exceed 1000 characters"],
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price cannot be negative"],
    },
    verifiedGuideCode: {
      type: String,
      default: "",
      trim: true,
    },
    maxGroupSize: {
      type: Number,
      default: 4,
      min: [1, "Group size must be at least 1"],
    },
    languagesSpoken: [{
      type: String,
      trim: true,
   
    }],
    specializations: [{
      type: String,
      trim: true,
     
    }],
    guidedToursCount: {
      type: Number,
      default: 0,
      min: 0,
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

guideSchema.index({ wilaya: 1, isActive: 1, rating: -1 });
guideSchema.index({ pricePerDay: 1, isActive: 1 });
guideSchema.index({ languagesSpoken: 1, isActive: 1 });
guideSchema.index({ specializations: 1, isActive: 1 });
guideSchema.index({ owner: 1, isActive: 1 });
guideSchema.index({ nameEn: "text", nameAr: "text", expertiseEn: "text" });

module.exports = mongoose.model("Guide", guideSchema);
