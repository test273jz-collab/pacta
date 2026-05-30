const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [128, "Password cannot exceed 128 characters"],
      select: false,
    },
    avatar: {
      type: String,
      required: [true, "Avatar image is required"],
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number too long"],
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location too long"],
      default: "",
    },
    role: {
      type: String,
      enum: {
        values: ["tourist", "hotel_owner", "resort_owner", "guide", "rental_owner", "admin"],
        message: "Role {VALUE} is not supported",
      },
      default: "tourist",
    },
    // Provider approval status — only relevant for non-tourist, non-admin roles
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    language: {
      type: String,
      enum: ["en", "ar", "fr"],
      default: "en",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ role: 1, approvalStatus: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
