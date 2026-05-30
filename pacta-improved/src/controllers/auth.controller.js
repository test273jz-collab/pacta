const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const Hotel = require("../models/hotel.model");
const Rental = require("../models/rental.model");
const Guide = require("../models/guide.model");
const Resort = require("../models/resort.model");
const generateToken = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

// Role-to-model mapping for provider registration
const serviceModelMap = {
  tourist: null,
  hotel_owner: Hotel,
  rental_owner: Rental,
  resort_owner: Resort,
  guide: Guide,
};

// ==================== LOGIN ====================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Account has been deactivated. Contact support.", 403));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, 200, "Login successful", { token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ==================== TOURIST REGISTRATION ====================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, avatar, language } = req.body;

    if (!name || !email || !password || !avatar) {
      return next(new AppError("Name, email, password, and avatar are required", 400));
    }

    if (password.length < 6 || password.length > 128) {
      return next(new AppError("Password must be between 6 and 128 characters", 400));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return next(new AppError("An account with this email already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatar,
      role: "tourist",
      approvalStatus: "approved", // tourists are auto-approved
      language: language || "en",
    });

    const token = generateToken(user._id, user.role);

    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, 201, "Registration successful", { token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ==================== COMPLETE PROVIDER REGISTRATION ====================
exports.registerComplete = async (req, res, next) => {
  const session = await User.startSession();

  try {
    await session.withTransaction(async () => {
      const {
        name, email, password, avatar, role, language,
        titleEn, titleAr, descEn, descAr,
        expertiseAr, expertiseEn, price, wilaya, images,
        roomsAvailable, propertyClass, structureType, roomsCount,
        bedsCount, bathroomsCount, maxCapacity, languagesSpoken,
        maxGroupSize, specializations,
      } = req.body;

      if (!name || !email || !password || !avatar || !role) {
        throw new AppError("Name, email, password, avatar, and role are required", 400);
      }

      if (!(role in serviceModelMap)) {
        throw new AppError(`Invalid role: ${role}. Must be a valid provider role.`, 400);
      }

      if (password.length < 6 || password.length > 128) {
        throw new AppError("Password must be between 6 and 128 characters", 400);
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).session(session);
      if (existingUser) {
        throw new AppError("An account with this email already exists", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const [user] = await User.create(
        [{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          avatar,
          role,
          approvalStatus: "pending", // providers wait for admin approval
          language: language || "en",
        }],
        { session }
      );

      const cloudImages = Array.isArray(images) ? images.filter((img) => img && typeof img === "string") : [];
      let serviceData = null;

      const baseServiceData = {
        owner: user._id,
        wilaya: wilaya || "",
        images: cloudImages,
        isActive: false, // inactive until admin approves
      };

      switch (role) {
        case "hotel_owner":
          serviceData = await Hotel.create(
            [{
              ...baseServiceData,
              titleEn: titleEn || name,
              titleAr: titleAr || name,
              descEn: descEn || "",
              descAr: descAr || "",
              pricePerNight: Math.max(0, Number(price) || 0),
              roomsAvailable: Math.max(1, Number(roomsAvailable) || 1),
              propertyClass: Math.min(5, Math.max(1, Number(propertyClass) || 3)),
            }],
            { session }
          );
          break;

        case "rental_owner":
          serviceData = await Rental.create(
            [{
              ...baseServiceData,
              titleEn: titleEn || name,
              titleAr: titleAr || name,
              descEn: descEn || "",
              descAr: descAr || "",
              pricePerNight: Math.max(0, Number(price) || 0),
              structure: {
                type: structureType || "apartment",
                roomsCount: Math.max(1, Number(roomsCount) || 1),
                bedsCount: Math.max(1, Number(bedsCount) || 1),
                bathroomsCount: Math.max(1, Number(bathroomsCount) || 1),
                maxGuests: Math.max(1, Number(maxCapacity) || 2),
              },
            }],
            { session }
          );
          break;

        case "resort_owner":
          serviceData = await Resort.create(
            [{
              ...baseServiceData,
              titleEn: titleEn || name,
              titleAr: titleAr || name,
              descEn: descEn || "",
              descAr: descAr || "",
              pricePerNight: Math.max(0, Number(price) || 0),
              maxCapacity: Math.max(1, Number(maxCapacity) || 2),
            }],
            { session }
          );
          break;

        case "guide":
          serviceData = await Guide.create(
            [{
              ...baseServiceData,
              nameEn: titleEn || name,
              nameAr: titleAr || name,
              expertiseEn: descEn || expertiseEn || "Expert Guide",
              expertiseAr: descAr || expertiseAr || "مرشد خبير",
              pricePerDay: Math.max(0, Number(price) || 0),
              maxGroupSize: Math.max(1, Number(maxGroupSize) || 4),
              languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : [],
              specializations: Array.isArray(specializations) ? specializations : [],
            }],
            { session }
          );
          break;

        case "tourist":
          // Tourists are always auto-approved — no service listing needed
          await User.findByIdAndUpdate(
            user._id,
            { approvalStatus: "approved" },
            { session }
          );
          break;
      }

      const token = generateToken(user._id, user.role);
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: "Registration successful. Your account is pending admin approval.",
        data: {
          token,
          user: userResponse,
          profile: serviceData ? serviceData[0] : null,
        },
      });
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Please provide your email address", 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return sendSuccess(res, 200, "If an account exists, a reset link has been sent");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    if (process.env.NODE_ENV === "development") {
      sendSuccess(res, 200, "If an account exists, a reset link has been sent", { resetUrl });
    } else {
      sendSuccess(res, 200, "If an account exists, a reset link has been sent");
    }
  } catch (error) {
    next(error);
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError("Reset token and new password are required", 400));
    }

    if (password.length < 6 || password.length > 128) {
      return next(new AppError("Password must be between 6 and 128 characters", 400));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return next(new AppError("Invalid or expired reset token", 400));
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = generateToken(user._id, user.role);
    sendSuccess(res, 200, "Password reset successful", { token: authToken });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL USERS (ADMIN) ====================
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive, approvalStatus } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Users retrieved", users, {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE USER ROLE (ADMIN) ====================
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["tourist", "hotel_owner", "resort_owner", "rental_owner", "guide", "admin"];
    if (!validRoles.includes(role)) {
      return next(new AppError("Invalid role specified", 400));
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    sendSuccess(res, 200, "User role updated", user);
  } catch (error) {
    next(error);
  }
};

// ==================== TOGGLE USER ACTIVE STATUS (ADMIN) ====================
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return next(new AppError("Cannot deactivate your own account", 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    sendSuccess(res, 200, `User ${user.isActive ? "activated" : "deactivated"} successfully`, {
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE USER (ADMIN) ====================
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return next(new AppError("Cannot delete your own account", 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Also deactivate their service listing
    const serviceModelMap = {
      hotel_owner: Hotel,
      rental_owner: Rental,
      resort_owner: Resort,
      guide: Guide,
    };

    const ServiceModel = serviceModelMap[user.role];
    if (ServiceModel) {
      await ServiceModel.updateMany({ owner: user._id }, { isActive: false });
    }

    await User.findByIdAndDelete(id);

    sendSuccess(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== APPROVE / REJECT PROVIDER (ADMIN) ====================
exports.updateProviderApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return next(new AppError("Invalid approval status", 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.role === "tourist" || user.role === "admin") {
      return next(new AppError("Approval only applies to provider accounts", 400));
    }

    user.approvalStatus = approvalStatus;
    await user.save();

    // Activate or deactivate their service listing
    const serviceModelMap = {
      hotel_owner: Hotel,
      rental_owner: Rental,
      resort_owner: Resort,
      guide: Guide,
    };

    const ServiceModel = serviceModelMap[user.role];
    if (ServiceModel) {
      await ServiceModel.updateMany(
        { owner: user._id },
        { isActive: approvalStatus === "approved" }
      );
    }

    sendSuccess(res, 200, `Provider ${approvalStatus}`, { approvalStatus });
  } catch (error) {
    next(error);
  }
};