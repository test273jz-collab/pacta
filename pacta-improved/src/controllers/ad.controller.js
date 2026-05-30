const Ad = require("../models/ad.model");
const { deleteFromCloudinary } = require("../utils/cloudinaryHelpers");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== GET ALL ACTIVE ADS (Public) ====================
exports.getAds = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ads, total] = await Promise.all([
      Ad.find({ isActive: true })
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Ad.countDocuments({ isActive: true }),
    ]);

    sendSuccess(res, 200, "Ads retrieved", ads, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE AD (Admin) ====================
exports.createAd = async (req, res, next) => {
  try {
    const { titleEn, titleAr, descEn, descAr, bgClass, link, displayOrder } = req.body;

    if (!titleEn || !titleAr || !link) {
      return next(new AppError("titleEn, titleAr, and link are required", 400));
    }

    const imageUrl = req.file?.path || "";

    const ad = await Ad.create({
      titleEn: titleEn.trim(),
      titleAr: titleAr.trim(),
      descEn: descEn || "",
      descAr: descAr || "",
      bgClass: bgClass || "from-blue-600 to-cyan-600",
      link: link.trim(),
      image: imageUrl,
      displayOrder: Number(displayOrder) || 0,
    });

    sendSuccess(res, 201, "Ad created successfully", ad);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE AD (Admin) ====================
exports.updateAd = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return next(new AppError("Ad not found", 404));

    const updates = {};
    const allowedFields = ["titleEn", "titleAr", "descEn", "descAr", "bgClass", "link", "isActive", "displayOrder"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file?.path) {
      // Delete old image from Cloudinary
      if (ad.image) await deleteFromCloudinary(ad.image);
      updates.image = req.file.path;
    }

    const updated = await Ad.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    sendSuccess(res, 200, "Ad updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE AD (Admin) ====================
exports.deleteAd = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return next(new AppError("Ad not found", 404));

    if (ad.image) await deleteFromCloudinary(ad.image);
    await Ad.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Ad deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== GET SINGLE AD ====================
exports.getAdById = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return next(new AppError("Ad not found", 404));
    sendSuccess(res, 200, "Ad retrieved", ad);
  } catch (error) {
    next(error);
  }
};
