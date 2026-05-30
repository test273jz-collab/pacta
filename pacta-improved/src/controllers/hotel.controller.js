const Hotel = require("../models/hotel.model");
const { deleteMultipleFromCloudinary } = require("../utils/cloudinaryHelpers");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== CREATE HOTEL ====================
exports.createHotel = async (req, res, next) => {
  try {
    const {
      titleEn, titleAr, descEn, descAr,
      pricePerNight, roomsAvailable, amenities,
      propertyClass, wilaya, images,
    } = req.body;

    if (!titleEn || !titleAr || !pricePerNight || !wilaya) {
      return next(new AppError("titleEn, titleAr, pricePerNight, and wilaya are required", 400));
    }

    const hotel = await Hotel.create({
      owner: req.user._id,
      titleEn: titleEn.trim(),
      titleAr: titleAr.trim(),
      descEn: descEn || "",
      descAr: descAr || "",
      pricePerNight: Math.max(0, Number(pricePerNight)),
      roomsAvailable: Math.max(1, Number(roomsAvailable) || 1),
      amenities: amenities || {},
      propertyClass: Math.min(5, Math.max(1, Number(propertyClass) || 3)),
      wilaya: wilaya.trim(),
      images: Array.isArray(images) ? images.filter((img) => img) : [],
    });

    sendSuccess(res, 201, "Hotel created successfully", hotel);
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL HOTELS (Public) ====================
exports.getHotels = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      wilaya,
      minPrice,
      maxPrice,
      propertyClass,
      amenities,
      search,
      sortBy = "rating",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { isActive: true };

    if (wilaya) filter.wilaya = new RegExp(wilaya, "i");
    if (propertyClass) filter.propertyClass = Number(propertyClass);
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.pricePerNight.$lte = Number(maxPrice);
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(",");
      amenityList.forEach((amenity) => {
        filter[`amenities.${amenity}`] = true;
      });
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Sorting
    const sort = {};
    if (search && sortBy === "rating") {
      sort.score = { $meta: "textScore" };
    }
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .populate("owner", "name email avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Hotel.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Hotels retrieved", hotels, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET HOTEL BY ID ====================
exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("owner", "name email avatar phone");

    if (!hotel) {
      return next(new AppError("Hotel not found", 404));
    }

    if (!hotel.isActive) {
      return next(new AppError("This hotel is no longer available", 410));
    }

    sendSuccess(res, 200, "Hotel retrieved", hotel);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE HOTEL ====================
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, owner: req.user._id });

    if (!hotel) {
      return next(new AppError("Hotel not found or you are not the owner", 404));
    }

    const updates = {};
    const allowedFields = [
      "titleEn", "titleAr", "descEn", "descAr",
      "pricePerNight", "roomsAvailable", "amenities",
      "propertyClass", "wilaya", "images", "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle new images (append if provided)
    if (req.body.images && Array.isArray(req.body.images)) {
      const newImages = req.body.images.filter((img) => img && !hotel.images.includes(img));
      if (newImages.length > 0) {
        updates.images = [...hotel.images, ...newImages].slice(0, 10); // Max 10 images
      }
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    sendSuccess(res, 200, "Hotel updated successfully", updatedHotel);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE HOTEL ====================
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, owner: req.user._id });

    if (!hotel) {
      return next(new AppError("Hotel not found or you are not the owner", 404));
    }

    // Delete images from Cloudinary
    if (hotel.images && hotel.images.length > 0) {
      await deleteMultipleFromCloudinary(hotel.images);
    }

    await Hotel.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Hotel deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==================== TOGGLE HOTEL ACTIVE STATUS ====================
exports.toggleHotelStatus = async (req, res, next) => {
  try {
    const hotel = await Hotel.findOne({ _id: req.params.id, owner: req.user._id });

    if (!hotel) {
      return next(new AppError("Hotel not found or you are not the owner", 404));
    }

    hotel.isActive = !hotel.isActive;
    await hotel.save();

    sendSuccess(res, 200, `Hotel ${hotel.isActive ? "activated" : "deactivated"} successfully`, {
      isActive: hotel.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET MY HOTELS (Provider) ====================
exports.getMyHotels = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hotels, total] = await Promise.all([
      Hotel.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Hotel.countDocuments({ owner: req.user._id }),
    ]);

    sendSuccess(res, 200, "Your hotels retrieved", hotels, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};
