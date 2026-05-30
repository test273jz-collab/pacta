const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
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
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    descAr: {
      type: String,
      required: [true, "Arabic description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    bgClass: {
      type: String,
      default: "from-blue-600 to-cyan-600",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      required: [true, "Link destination is required"],
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

adSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model("Ad", adSchema);
