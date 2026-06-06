const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    // ── Titles (bilingual) ────────────────────────────
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

    // ── Descriptions (bilingual) ──────────────────────
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

    // ── Media ─────────────────────────────────────────
    // Video (Cloudinary URL or any CDN link — mp4 preferred)
    video: {
      type: String,
      default: "",
    },
    // Poster/thumbnail shown while video loads or on mobile fallback
    poster: {
      type: String,
      default: "",
    },

    // ── Classification ────────────────────────────────
    // sahara | beach | culture | mountain | city | nature
    category: {
      type: String,
      enum: ["sahara", "beach", "culture", "mountain", "city", "nature"],
      required: [true, "Category is required"],
    },

    // ── Navigation ────────────────────────────────────
    link: {
      type: String,
      required: [true, "Link destination is required"],
      trim: true,
    },

    // ── Control ───────────────────────────────────────
    displayOrder: { type: Number, default: 0 },
    clickCount:   { type: Number, default: 0, min: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

adSchema.index({ isActive: 1, displayOrder: 1 });
adSchema.index({ category: 1 });

module.exports = mongoose.model("Ad", adSchema);