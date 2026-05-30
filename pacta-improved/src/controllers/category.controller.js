const Category = require("../models/category.model");
const { deleteFromCloudinary } = require("../utils/cloudinaryHelpers");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

// ==================== GET ALL CATEGORIES (Public) ====================
exports.getCategories = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const categories = await Category.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    sendSuccess(res, 200, "Categories retrieved", categories);
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE CATEGORY (Admin) ====================
exports.createCategory = async (req, res, next) => {
  try {
    const { slug, labelEn, labelAr, iconName, countString, bgClass, displayOrder } = req.body;

    if (!slug || !labelEn || !labelAr || !iconName) {
      return next(new AppError("slug, labelEn, labelAr, and iconName are required", 400));
    }

    // Check for existing slug
    const exists = await Category.findOne({ slug: slug.toLowerCase().trim() });
    if (exists) {
      return next(new AppError("Category with this slug already exists", 409));
    }

    const imageUrl = req.file?.path || "";

    const category = await Category.create({
      slug: slug.toLowerCase().trim(),
      labelEn: labelEn.trim(),
      labelAr: labelAr.trim(),
      iconName: iconName.trim(),
      countString: countString || "0+",
      bgClass: bgClass || "bg-blue-50 text-blue-600",
      image: imageUrl,
      displayOrder: Number(displayOrder) || 0,
    });

    sendSuccess(res, 201, "Category created successfully", category);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE CATEGORY (Admin) ====================
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError("Category not found", 404));

    const updates = {};
    const allowedFields = ["slug", "labelEn", "labelAr", "iconName", "countString", "bgClass", "isActive", "displayOrder"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === "slug" ? req.body[field].toLowerCase().trim() : req.body[field];
      }
    });

    if (req.file?.path) {
      if (category.image) await deleteFromCloudinary(category.image);
      updates.image = req.file.path;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    sendSuccess(res, 200, "Category updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE CATEGORY (Admin) ====================
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError("Category not found", 404));

    if (category.image) await deleteFromCloudinary(category.image);
    await Category.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== GET CATEGORY BY SLUG ====================
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return next(new AppError("Category not found", 404));
    sendSuccess(res, 200, "Category retrieved", category);
  } catch (error) {
    next(error);
  }
};
