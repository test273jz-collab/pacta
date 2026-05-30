const Wishlist = require("../models/wishlist.model");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");
const Hotel = require("../models/hotel.model");
const Rental = require("../models/rental.model");
const Resort = require("../models/resort.model");
const Guide = require("../models/guide.model");


// ==================== ADD TO WISHLIST ====================
exports.addToWishlist = async (req, res, next) => {
  try {
    const { listingId, listingModel, notes } = req.body;
    // make the first charactere from listing model majuscule
   const model = listingModel.charAt(0).toUpperCase() + listingModel.slice(1);


    if (!listingId || !listingModel) {
      return next(new AppError("listingId and listingModel are required", 400));
    }

    const validModels = ["Hotel", "Rental", "Resort", "Guide"];
    
    if (!validModels.includes( model)) {
      return next(new AppError(`listingModel must be one of: ${validModels.join(", ")}`, 400));
    }

    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      listingId,
      listingModel: model,
      notes: notes?.trim() || "",
    });

    sendSuccess(res, 201, "Added to wishlist", wishlistItem);
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("This item is already in your wishlist", 409));
    }
    next(error);
  }
};

// ==================== GET MY WISHLIST ====================
exports.getMyWishlist = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Wishlist.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Wishlist.countDocuments({ user: req.user._id }),
    ]);

    const enriched = await Promise.all(items.map(async (item) => {
      let listingDetails;
      switch (item.listingModel) {
        case "Hotel":
          listingDetails = await Hotel.findById(item.listingId).lean();
          break;
        case "Rental":
          listingDetails = await Rental.findById(item.listingId).lean();
          break;
        case "Resort":
          listingDetails = await Resort.findById(item.listingId).lean();
          break;
        case "Guide":
          listingDetails = await Guide.findById(item.listingId).lean();
          break;
        default:
          break;
      }
      return { ...item, listingDetails };
    }));
    sendSuccess(res, 200, "Wishlist retrieved", enriched, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== REMOVE FROM WISHLIST ====================
exports.removeFromWishlist = async (req, res, next) => {
  console.log(req.params);
  try {
    const item = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) return next(new AppError("Wishlist item not found", 404));

    sendSuccess(res, 200, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};

// ==================== CHECK IF IN WISHLIST ====================
exports.checkWishlist = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const item = await Wishlist.findOne({
      user: req.user._id,
      listingId,
    });

    sendSuccess(res, 200, "Wishlist status retrieved", { inWishlist: !!item, item });
  } catch (error) {
    next(error);
  }
};
