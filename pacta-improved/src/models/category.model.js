const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    labelEn: {
      type: String,
      required: [true, "English label is required"],
      trim: true,
      maxlength: [100, "Label cannot exceed 100 characters"],
    },
    labelAr: {
      type: String,
      required: [true, "Arabic label is required"],
      trim: true,
      maxlength: [100, "Label cannot exceed 100 characters"],
    },
    iconName: {
      type: String,
      required: [true, "Icon name is required"],
      trim: true,
    },
    countString: {
      type: String,
      default: "0+",
      trim: true,
    },
    bgClass: {
      type: String,
      default: "bg-blue-50 text-blue-600",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ displayOrder: 1, isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);
