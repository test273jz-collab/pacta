const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Hotel = require("../models/hotel.model");
const Resort = require("../models/resort.model");
const Guide = require("../models/guide.model");
const Rental = require("../models/rental.model");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

// Role-to-model mapping
const serviceModelMap = {
  hotel_owner: Hotel,
  resort_owner: Resort,
  guide: Guide,
  rental_owner: Rental,
};

// ==================== GET COMPLETE PROFILE ====================
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) return next(new AppError("User not found", 404));

    let businessListing = null;
    const BusinessModel = serviceModelMap[user.role];

    if (BusinessModel) {
      businessListing = await BusinessModel.findOne({ owner: user._id });
    }

    sendSuccess(res, 200, "Profile retrieved", { user, businessListing });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE PROFILE ====================
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const allowedUserFields = ["name", "phone", "location", "bio", "language", "avatar"];

    allowedUserFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === "name" || field === "bio" || field === "location" ? req.body[field]?.trim() : req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!user) return next(new AppError("User not found", 404));

    // Update business listing if businessData provided
    let businessListing = null;
    const BusinessModel = serviceModelMap[user.role];

    if (BusinessModel && req.body.businessData) {
      try {
        const businessPayload = typeof req.body.businessData === "string"
          ? JSON.parse(req.body.businessData)
          : req.body.businessData;

        // Handle images from upload
        if (req.files?.images?.length > 0) {
          const newImages = req.files.images.map((f) => f.path);
          businessPayload.images = businessPayload.images
            ? [...businessPayload.images, ...newImages]
            : newImages;
        }

        businessListing = await BusinessModel.findOneAndUpdate(
          { owner: user._id },
          { $set: businessPayload },
          { new: true, upsert: true, runValidators: true }
        );
      } catch (parseError) {
        return next(new AppError("Invalid businessData format", 400));
      }
    }

    sendSuccess(res, 200, "Profile updated successfully", { user, businessListing });
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGE PASSWORD ====================
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError("Current password and new password are required", 400));
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      return next(new AppError("New password must be between 6 and 128 characters", 400));
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 400));
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    sendSuccess(res, 200, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};
