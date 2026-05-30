const Hotel = require("../models/hotel.model");
const Rental = require("../models/rental.model");
const Resort = require("../models/resort.model");
const Guide = require("../models/guide.model");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// Model mapping with metadata
const listingConfig = {
  hotel: { Model: Hotel, label: "hotel", priceField: "pricePerNight" },
  resort: { Model: Resort, label: "resort", priceField: "pricePerNight" },
  guide: { Model: Guide, label: "guide", priceField: "pricePerDay" },
  rental: { Model: Rental, label: "rental", priceField: "pricePerNight" },
};

// ==================== GET UNIFIED LISTINGS ====================
exports.getListings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      wilaya,
      category, // ✅ added
      minPrice,
      maxPrice,
      minRating,
      sortBy = "rating",
      sortOrder = "desc",
      search,
    } = req.query;

    const types = type ? type.split(",") : Object.keys(listingConfig);
    const allResults = [];

    // Base filter builder (shared across all models)
    const buildFilter = (config) => {
      const filter = { isActive: true };

      if (wilaya) filter.wilaya = new RegExp(wilaya, "i");
      if (minRating) filter.rating = { $gte: Number(minRating) };

      // ✅ CATEGORY SUPPORT ADDED
      if (category) filter.category = category;

      // Price filter (type-specific field)
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter[config.priceField] = {};
        if (minPrice !== undefined) {
          filter[config.priceField].$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
          filter[config.priceField].$lte = Number(maxPrice);
        }
      }

      // Search filter
      if (search) {
        filter.$or = [
          { titleEn: { $regex: search, $options: "i" } },
          { titleAr: { $regex: search, $options: "i" } },
          { nameEn: { $regex: search, $options: "i" } },
          { nameAr: { $regex: search, $options: "i" } },
        ];
      }

      return filter;
    };

    // Fetch per type
    for (const t of types) {
      const config = listingConfig[t.toLowerCase()];
      if (!config) continue;

      const filter = buildFilter(config);

      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      const items = await config.Model.find(filter)
        .populate("owner", "name email avatar phone")
        .sort(sort)
        .limit(100)
        .lean();

      items.forEach((item) => {
        const price = item[config.priceField] || 0;

        const titleEn = item.titleEn || item.nameEn || "";
        const titleAr = item.titleAr || item.nameAr || "";

        const descEn = item.descEn || item.expertiseEn || "";
        const descAr = item.descAr || item.expertiseAr || "";

        allResults.push({
          _id: item._id,
          listingType: config.label,

          titleEn,
          titleAr,
          nameEn: titleEn,
          nameAr: titleAr,

          descEn,
          descAr,

          wilaya: item.wilaya,
          rating: item.rating || 5.0,
          reviewCount: item.reviewCount || 0,

          images: item.images || [],
          image: item.images?.[0] || null,

          price,
          pricePerNight:
            config.priceField === "pricePerNight" ? price : undefined,
          pricePerDay:
            config.priceField === "pricePerDay" ? price : undefined,

          href: `/providers/${config.label}/${item._id}`,

          owner: item.owner,
          createdAt: item.createdAt,

          // Type-specific fields
          ...(config.label === "hotel" && {
            roomsAvailable: item.roomsAvailable,
            amenities: item.amenities,
            propertyClass: item.propertyClass,
          }),

          ...(config.label === "rental" && {
            structure: item.structure,
            houseFeatures: item.houseFeatures,
            maxGuests: item.structure?.maxGuests,
          }),

          ...(config.label === "resort" && {
            leisureActivities: item.leisureActivities,
            maxCapacity: item.maxCapacity,
          }),

          ...(config.label === "guide" && {
            languagesSpoken: item.languagesSpoken,
            specializations: item.specializations,
            maxGroupSize: item.maxGroupSize,
          }),
        });
      });
    }

    // Sort combined results
    allResults.sort((a, b) => {
      const aVal = sortBy === "price" ? a.price : a.rating;
      const bVal = sortBy === "price" ? b.price : b.rating;

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    // Pagination
    const total = allResults.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const start = (pageNum - 1) * limitNum;
    const paginated = allResults.slice(start, start + limitNum);

    return sendSuccess(
      res,
      200,
      "Listings retrieved",
      paginated,
      getPaginationMeta(pageNum, limitNum, total)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== GET LISTING BY ID ====================
exports.getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try all collections in parallel
    const [hotel, resort, guide, rental] = await Promise.all([
      Hotel.findById(id).populate("owner", "name email avatar phone"),
      Resort.findById(id).populate("owner", "name email avatar phone"),
      Guide.findById(id).populate("owner", "name email avatar phone"),
      Rental.findById(id).populate("owner", "name email avatar phone"),
    ]);

    const listing = hotel || resort || guide || rental;

    if (!listing) {
      return next(new AppError("Listing not found", 404));
    }

    if (!listing.isActive) {
      return next(new AppError("This listing is no longer available", 410));
    }

    sendSuccess(res, 200, "Listing retrieved", listing);
  } catch (error) {
    next(error);
  }
};

exports.getListingByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    console.log(category)
     const [hotel, resort, guide, rental] = await Promise.all([
      Hotel.find({ category: category }).populate(),
      Resort.find({ category: category }).populate("owner", "name email avatar phone"),
      Guide.find({ category: category }).populate(),
      Rental.find({ category: category }).populate(),
    ]);
    const listing = {
      hotel,
      resort,
      guide,
      rental,
    }

     

    if (!listing) {
      return next(new AppError("Listing not found", 404));
    }



    sendSuccess(res, 200, "Listing retrieved", listing);

    

}
catch (error) {
    next(error);
  }
};


