const Guide = require("../models/guide.model");
const { deleteMultipleFromCloudinary } = require("../utils/cloudinaryHelpers");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== CREATE GUIDE ====================
exports.createGuide = async (req, res, next) => {
  try {
    const {
      nameEn, nameAr, expertiseEn, expertiseAr,
      pricePerDay, maxGroupSize, languagesSpoken,
      specializations, wilaya, images, verifiedGuideCode,
    } = req.body;

    if (!nameEn || !nameAr || !pricePerDay || !wilaya) {
      return next(new AppError("nameEn, nameAr, pricePerDay, and wilaya are required", 400));
    }

    const guide = await Guide.create({
      owner: req.user._id,
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      expertiseEn: expertiseEn || "",
      expertiseAr: expertiseAr || "",
      pricePerDay: Math.max(0, Number(pricePerDay)),
      maxGroupSize: Math.max(1, Number(maxGroupSize) || 4),
      languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : [],
      specializations: Array.isArray(specializations) ? specializations : [],
      wilaya: wilaya.trim(),
      verifiedGuideCode: verifiedGuideCode || "",
      images: Array.isArray(images) ? images.filter((img) => img) : [],
    });

    sendSuccess(res, 201, "Guide profile created successfully", guide);
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL GUIDES (Public) ====================
exports.getGuides = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, wilaya,
      minPrice, maxPrice, language,
      specialization, search, sortBy = "rating", sortOrder = "desc",
    } = req.query;

    const filter = { isActive: true };

    if (wilaya) filter.wilaya = new RegExp(wilaya, "i");
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerDay = {};
      if (minPrice !== undefined) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (language) {
      filter.languagesSpoken = { $in: [language] };
    }
    if (specialization) {
      filter.specializations = { $in: specialization.split(",") };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = {};
    if (search && sortBy === "rating") {
      sort.score = { $meta: "textScore" };
    }
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [guides, total] = await Promise.all([
      Guide.find(filter)
        .populate("owner", "name email avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Guide.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Guides retrieved", guides, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET GUIDE BY ID ====================
exports.getGuideById = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate("owner", "name email avatar phone");

    if (!guide) return next(new AppError("Guide not found", 404));
    if (!guide.isActive) return next(new AppError("This guide profile is no longer available", 410));

    sendSuccess(res, 200, "Guide retrieved", guide);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE GUIDE ====================
exports.updateGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findOne({ _id: req.params.id, owner: req.user._id });
    if (!guide) return next(new AppError("Guide not found or you are not the owner", 404));

    const updates = {};
    const allowedFields = [
      "nameEn", "nameAr", "expertiseEn", "expertiseAr",
      "pricePerDay", "maxGroupSize", "languagesSpoken",
      "specializations", "wilaya", "images", "isActive",
      "verifiedGuideCode",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.images && Array.isArray(req.body.images)) {
      const newImages = req.body.images.filter((img) => img && !guide.images.includes(img));
      if (newImages.length > 0) {
        updates.images = [...guide.images, ...newImages].slice(0, 10);
      }
    }

    const updated = await Guide.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    sendSuccess(res, 200, "Guide updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE GUIDE ====================
exports.deleteGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findOne({ _id: req.params.id, owner: req.user._id });
    if (!guide) return next(new AppError("Guide not found or you are not the owner", 404));

    if (guide.images?.length > 0) await deleteMultipleFromCloudinary(guide.images);
    await Guide.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Guide profile deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== TOGGLE GUIDE STATUS ====================
exports.toggleGuideStatus = async (req, res, next) => {
  try {
    const guide = await Guide.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );
    if (!guide) return next(new AppError("Guide not found or you are not the owner", 404));

    sendSuccess(res, 200, `Guide ${guide.isActive ? "activated" : "deactivated"} successfully`, { isActive: guide.isActive });
  } catch (error) {
    next(error);
  }
};

// ==================== GET MY GUIDE PROFILE ====================
exports.getMyGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findOne({ owner: req.user._id });
    if (!guide) return next(new AppError("Guide profile not found", 404));

    sendSuccess(res, 200, "Guide profile retrieved", guide);
  } catch (error) {
    next(error);
  }
};
