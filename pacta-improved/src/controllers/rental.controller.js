const Rental = require("../models/rental.model");
const { deleteMultipleFromCloudinary } = require("../utils/cloudinaryHelpers");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== CREATE RENTAL ====================
exports.createRental = async (req, res, next) => {
  try {
    const {
      titleEn, titleAr, descEn, descAr,
      pricePerNight, structure, houseFeatures,
      rentalRulesEn, rentalRulesAr, wilaya, images,
    } = req.body;

    if (!titleEn || !titleAr || !pricePerNight || !wilaya || !structure) {
      return next(new AppError("titleEn, titleAr, pricePerNight, wilaya, and structure are required", 400));
    }

    const rental = await Rental.create({
      owner: req.user._id,
      titleEn: titleEn.trim(),
      titleAr: titleAr.trim(),
      descEn: descEn || "",
      descAr: descAr || "",
      pricePerNight: Math.max(0, Number(pricePerNight)),
      structure: {
        roomsCount: Math.max(1, Number(structure.roomsCount) || 1),
        bedsCount: Math.max(1, Number(structure.bedsCount) || 1),
        bathroomsCount: Math.max(1, Number(structure.bathroomsCount) || 1),
        maxGuests: Math.max(1, Number(structure.maxGuests) || 2),
      },
      houseFeatures: houseFeatures || {},
      rentalRulesEn: rentalRulesEn || "",
      rentalRulesAr: rentalRulesAr || "",
      wilaya: wilaya.trim(),
      images: Array.isArray(images) ? images.filter((img) => img) : [],
    });

    sendSuccess(res, 201, "Rental created successfully", rental);
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL RENTALS (Public) ====================
exports.getRentals = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, wilaya,
      minPrice, maxPrice, minGuests,
      amenities, search, sortBy = "rating", sortOrder = "desc",
    } = req.query;

    const filter = { isActive: true };

    if (wilaya) filter.wilaya = new RegExp(wilaya, "i");
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.pricePerNight.$lte = Number(maxPrice);
    }
    if (minGuests) {
      filter["structure.maxGuests"] = { $gte: Number(minGuests) };
    }
    if (amenities) {
      amenities.split(",").forEach((amenity) => {
        filter[`houseFeatures.${amenity}`] = true;
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

    const [rentals, total] = await Promise.all([
      Rental.find(filter)
        .populate("owner", "name email avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Rental.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Rentals retrieved", rentals, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET RENTAL BY ID ====================
exports.getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("owner", "name email avatar phone");

    if (!rental) return next(new AppError("Rental not found", 404));
    if (!rental.isActive) return next(new AppError("This rental is no longer available", 410));

    sendSuccess(res, 200, "Rental retrieved", rental);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE RENTAL ====================
exports.updateRental = async (req, res, next) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, owner: req.user._id });
    if (!rental) return next(new AppError("Rental not found or you are not the owner", 404));

    const updates = {};
    const allowedFields = [
      "titleEn", "titleAr", "descEn", "descAr", "pricePerNight",
      "structure", "houseFeatures", "rentalRulesEn", "rentalRulesAr",
      "wilaya", "images", "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.images && Array.isArray(req.body.images)) {
      const newImages = req.body.images.filter((img) => img && !rental.images.includes(img));
      if (newImages.length > 0) {
        updates.images = [...rental.images, ...newImages].slice(0, 10);
      }
    }

    const updated = await Rental.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    sendSuccess(res, 200, "Rental updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE RENTAL ====================
exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, owner: req.user._id });
    if (!rental) return next(new AppError("Rental not found or you are not the owner", 404));

    if (rental.images?.length > 0) await deleteMultipleFromCloudinary(rental.images);
    await Rental.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Rental deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== TOGGLE RENTAL STATUS ====================
exports.toggleRentalStatus = async (req, res, next) => {
  try {
    const rental = await Rental.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );
    if (!rental) return next(new AppError("Rental not found or you are not the owner", 404));

    sendSuccess(res, 200, `Rental ${rental.isActive ? "activated" : "deactivated"} successfully`, { isActive: rental.isActive });
  } catch (error) {
    next(error);
  }
};

// ==================== GET MY RENTALS ====================
exports.getMyRentals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rentals, total] = await Promise.all([
      Rental.find({ owner: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Rental.countDocuments({ owner: req.user._id }),
    ]);

    sendSuccess(res, 200, "Your rentals retrieved", rentals, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};
