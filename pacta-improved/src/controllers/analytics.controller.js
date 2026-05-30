const mongoose = require("mongoose");
const User = require("../models/user.model");
const Hotel = require("../models/hotel.model");
const Rental = require("../models/rental.model");
const Resort = require("../models/resort.model");
const Guide = require("../models/guide.model");
const Reservation = require("../models/reservation.model");
const Review = require("../models/review.model");
const Contact = require("../models/contact.model");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

// ==================== PLATFORM OVERVIEW ====================
exports.getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalHotels,
      totalRentals,
      totalResorts,
      totalGuides,
      totalReservations,
      totalReviews,
      pendingContacts,
      recentReservations,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments({ isActive: true }),
      Rental.countDocuments({ isActive: true }),
      Resort.countDocuments({ isActive: true }),
      Guide.countDocuments({ isActive: true }),
      Reservation.countDocuments(),
      Review.countDocuments(),
      Contact.countDocuments({ status: "new" }),
      Reservation.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    sendSuccess(res, 200, "Analytics overview retrieved", {
      counts: {
        users: totalUsers,
        hotels: totalHotels,
        rentals: totalRentals,
        resorts: totalResorts,
        guides: totalGuides,
        reservations: totalReservations,
        reviews: totalReviews,
        pendingContacts,
      },
      recentActivity: {
        reservationsLast30Days: recentReservations,
        newUsersLast30Days: recentUsers,
      },
      totalListings: totalHotels + totalRentals + totalResorts + totalGuides,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== RESERVATION STATISTICS ====================
exports.getReservationStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const statusStats = await Reservation.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const dailyStats = await Reservation.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const typeStats = await Reservation.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$listingModel", count: { $sum: 1 } } },
    ]);

    sendSuccess(res, 200, "Reservation statistics retrieved", {
      statusDistribution: statusStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      dailyTrends: dailyStats,
      byType: typeStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REVENUE ANALYTICS ====================
exports.getRevenueStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const revenue = await Reservation.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          avgOrderValue: { $avg: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const monthlyRevenue = await Reservation.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    sendSuccess(res, 200, "Revenue statistics retrieved", {
      summary: revenue[0] || { totalRevenue: 0, avgOrderValue: 0, totalOrders: 0 },
      monthlyTrend: monthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER GROWTH ====================
exports.getUserGrowth = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const dailyGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    sendSuccess(res, 200, "User growth retrieved", {
      dailyGrowth,
      byRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== FLAGGED REVIEWS STATS ====================
exports.getReviewStats = async (req, res, next) => {
  try {
    const Review = require("../models/review.model");

    const [total, approved, flagged, pending] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ isApproved: true }),
      Review.countDocuments({ isFlagged: true }),
      Review.countDocuments({ isApproved: false }),
    ]);

    const ratingDist = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    sendSuccess(res, 200, "Review stats retrieved", {
      total, approved, flagged, pending,
      ratingDistribution: ratingDist.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TOP PERFORMERS ====================
exports.getTopPerformers = async (req, res, next) => {
  try {
    const { type = "all", limit = 10 } = req.query;

    const result = {};

    if (type === "all" || type === "hotel") {
      result.hotels = await Hotel.find({ isActive: true })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(parseInt(limit))
        .select("titleEn titleAr wilaya rating reviewCount pricePerNight images")
        .lean();
    }

    if (type === "all" || type === "rental") {
      result.rentals = await Rental.find({ isActive: true })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(parseInt(limit))
        .select("titleEn titleAr wilaya rating reviewCount pricePerNight images")
        .lean();
    }

    if (type === "all" || type === "resort") {
      result.resorts = await Resort.find({ isActive: true })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(parseInt(limit))
        .select("titleEn titleAr wilaya rating reviewCount pricePerNight images")
        .lean();
    }

    if (type === "all" || type === "guide") {
      result.guides = await Guide.find({ isActive: true })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(parseInt(limit))
        .select("nameEn nameAr wilaya rating reviewCount pricePerDay images")
        .lean();
    }

    sendSuccess(res, 200, "Top performers retrieved", result);
  } catch (error) {
    next(error);
  }
};
