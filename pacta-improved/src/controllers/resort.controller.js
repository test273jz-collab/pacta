const Resort = require("../models/resort.model");
const { deleteMultipleFromCloudinary } = require("../utils/cloudinaryHelpers");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== CREATE RESORT ====================
exports.createResort = async (req, res, next) => {
  try {
    const {
      titleEn, titleAr, descEn, descAr,
      pricePerNight, leisureActivities, maxCapacity,
      wilaya, images,
    } = req.body;

    if (!titleEn || !titleAr || !pricePerNight || !wilaya) {
      return next(new AppError("titleEn, titleAr, pricePerNight, and wilaya are required", 400));
    }

    const resort = await Resort.create({
      owner: req.user._id,
      titleEn: titleEn.trim(),
      titleAr: titleAr.trim(),
      descEn: descEn || "",
      descAr: descAr || "",
      pricePerNight: Math.max(0, Number(pricePerNight)),
      leisureActivities: leisureActivities || {},
      maxCapacity: Math.max(1, Number(maxCapacity) || 2),
      wilaya: wilaya.trim(),
      images: Array.isArray(images) ? images.filter((img) => img) : [],
    });

    sendSuccess(res, 201, "Resort created successfully", resort);
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL RESORTS (Public) ====================
exports.getResorts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, wilaya,
      minPrice, maxPrice, minCapacity,
      activities, search, sortBy = "rating", sortOrder = "desc",
    } = req.query;

    const filter = { isActive: true };

    if (wilaya) filter.wilaya = new RegExp(wilaya, "i");
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.pricePerNight.$lte = Number(maxPrice);
    }
    if (minCapacity) {
      filter.maxCapacity = { $gte: Number(minCapacity) };
    }
    if (activities) {
      activities.split(",").forEach((activity) => {
        filter[`leisureActivities.${activity}`] = true;
      });
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

    const [resorts, total] = await Promise.all([
      Resort.find(filter)
        .populate("owner", "name email avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Resort.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Resorts retrieved", resorts, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET RESORT BY ID ====================
exports.getResortById = async (req, res, next) => {
  try {
    const resort = await Resort.findById(req.params.id)
      .populate("owner", "name email avatar phone");

    if (!resort) return next(new AppError("Resort not found", 404));
    if (!resort.isActive) return next(new AppError("This resort is no longer available", 410));

    sendSuccess(res, 200, "Resort retrieved", resort);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE RESORT ====================
exports.updateResort = async (req, res, next) => {
  try {
    const resort = await Resort.findOne({ _id: req.params.id, owner: req.user._id });
    if (!resort) return next(new AppError("Resort not found or you are not the owner", 404));

    const updates = {};
    const allowedFields = [
      "titleEn", "titleAr", "descEn", "descAr",
      "pricePerNight", "leisureActivities", "maxCapacity",
      "wilaya", "images", "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.images && Array.isArray(req.body.images)) {
      const newImages = req.body.images.filter((img) => img && !resort.images.includes(img));
      if (newImages.length > 0) {
        updates.images = [...resort.images, ...newImages].slice(0, 10);
      }
    }

    const updated = await Resort.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    sendSuccess(res, 200, "Resort updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE RESORT ====================
exports.deleteResort = async (req, res, next) => {
  try {
    const resort = await Resort.findOne({ _id: req.params.id, owner: req.user._id });
    if (!resort) return next(new AppError("Resort not found or you are not the owner", 404));

    if (resort.images?.length > 0) await deleteMultipleFromCloudinary(resort.images);
    await Resort.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Resort deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== TOGGLE RESORT STATUS ====================
exports.toggleResortStatus = async (req, res, next) => {
  try {
    const resort = await Resort.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );
    if (!resort) return next(new AppError("Resort not found or you are not the owner", 404));

    sendSuccess(res, 200, `Resort ${resort.isActive ? "activated" : "deactivated"} successfully`, { isActive: resort.isActive });
  } catch (error) {
    next(error);
  }
};

// ==================== GET MY RESORTS ====================
exports.getMyResorts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [resorts, total] = await Promise.all([
      Resort.find({ owner: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Resort.countDocuments({ owner: req.user._id }),
    ]);

    sendSuccess(res, 200, "Your resorts retrieved", resorts, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};
