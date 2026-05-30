const Reservation = require("../models/reservation.model");
const Hotel = require("../models/hotel.model");
const Rental = require("../models/rental.model");
const Resort = require("../models/resort.model");
const Guide = require("../models/guide.model");
const Notification = require("../models/notification.model");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// Unified model map with correct enum casing
const modelMap = {
  hotel: Hotel,
  rental: Rental,
  resort: Resort,
  guide: Guide,
};

const modelEnumMap = {
  hotel: "Hotel",
  rental: "Rental",
  resort: "Resort",
  guide: "Guide",
};

// ==================== HELPER: Fetch listing details ====================
const fetchListingDetails = async (listingId, listingModel) => {
  const Model = modelMap[listingModel.toLowerCase()];
  if (!Model) return null;

  try {
    const doc = await Model.findById(listingId).lean();
    if (!doc) return null;

    return {
      ...doc,
      titleEn: doc.titleEn || doc.nameEn,
      titleAr: doc.titleAr || doc.nameAr,
      nameEn: doc.nameEn || doc.titleEn,
      nameAr: doc.nameAr || doc.titleAr,
    };
  } catch {
    return null;
  }
};

// ==================== HELPER: Enrich reservations ====================
const enrichReservations = async (reservations) => {
  return Promise.all(
    reservations.map(async (res) => {
      const listingDetails = await fetchListingDetails(res.listingId, res.listingModel);
      return {
        ...res.toObject(),
        listingDetails,
      };
    })
  );
};

// ==================== HELPER: Create notification ====================
const createNotification = async (recipient, type, title, message, data = null) => {
  try {
    await Notification.create({ recipient, type, title, message, data });
  } catch (error) {
    console.error("Notification creation failed:", error.message);
  }
};

// ==================== CREATE RESERVATION ====================
exports.createReservation = async (req, res, next) => {
  const session = await Reservation.startSession();

  try {
    await session.withTransaction(async () => {
      const { listingId, listingModel, startDate, endDate, specialRequests, guestCount } = req.body;
      const touristId = req.user._id;

      // Validate listingModel
      const formattedModel = modelEnumMap[listingModel.toLowerCase()];
      if (!formattedModel) {
        throw new AppError("Invalid listingModel. Must be: hotel, rental, resort, or guide", 400);
      }

      const TargetModel = modelMap[listingModel.toLowerCase()];
      const listing = await TargetModel.findById(listingId).session(session);

      if (!listing) {
        throw new AppError("Listing not found", 404);
      }

      if (!listing.isActive) {
        throw new AppError("This listing is no longer available", 400);
      }

      // Calculate duration and price
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

      if (totalDays <= 0) {
        throw new AppError("End date must be after start date", 400);
      }

      const basePrice = listing.pricePerNight || listing.pricePerDay || 0;
      const totalPrice = basePrice * totalDays;

      // Create reservation
      const [reservation] = await Reservation.create(
        [
          {
            tourist: touristId,
            provider: listing.owner,
            listingId,
            listingModel: formattedModel,
            startDate: start,
            endDate: end,
            totalPrice,
            guestCount: Math.max(1, Number(guestCount) || 1),
            specialRequests: specialRequests?.trim() || "",
          },
        ],
        { session }
      );

      // Populate and enrich
      const populated = await Reservation.findById(reservation._id)
        .populate("tourist", "name email avatar")
        .populate("provider", "name email role")
        .session(session);

      const listingDetails = await fetchListingDetails(listingId, formattedModel);

      // Notify provider
      await createNotification(
        listing.owner,
        "reservation_new",
        "New Booking Request",
        `You have a new booking request from ${req.user.name}`,
        { reservationId: reservation._id, listingId, listingModel: formattedModel }
      );

      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        data: { ...populated.toObject(), listingDetails },
      });
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

// ==================== GET MY RESERVATIONS (Tourist) ====================
exports.getMyReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { tourist: req.user._id };
    if (status) filter.status = status;

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate("tourist", "name email avatar")
        .populate("provider", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(filter),
    ]);

    const enriched = await enrichReservations(reservations);
    sendSuccess(res, 200, "Reservations retrieved", enriched, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET PROVIDER RESERVATIONS ====================
exports.getProviderReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { provider: req.user._id };
    if (status) filter.status = status;

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate("tourist", "name email avatar phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(filter),
    ]);

    const enriched = await enrichReservations(reservations);
    sendSuccess(res, 200, "Provider reservations retrieved", enriched, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE RESERVATION STATUS ====================
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!allowedStatuses.includes(status)) {
      return next(new AppError(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`, 400));
    }

    const booking = await Reservation.findById(req.params.id)
      .populate("tourist", "name email")
      .populate("provider", "name email");

    if (!booking) return next(new AppError("Reservation not found", 404));

    const isTourist = booking.tourist._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();

    if (!isTourist && !isProvider) {
      return next(new AppError("Not authorized to modify this reservation", 403));
    }

    // Tourists can only cancel
    if (isTourist && status !== "cancelled") {
      return next(new AppError("Tourists can only cancel reservations", 403));
    }

    // Providers can confirm, complete, or cancel
    if (isProvider && !["confirmed", "completed", "cancelled"].includes(status)) {
      return next(new AppError("Invalid status change for provider", 400));
    }

    booking.status = status;
    await booking.save();

    // Notify the other party
    const notifyUserId = isTourist ? booking.provider._id : booking.tourist._id;
    const statusMessages = {
      confirmed: { title: "Booking Confirmed", msg: `Your booking has been confirmed` },
      cancelled: { title: "Booking Cancelled", msg: `Your booking has been cancelled` },
      completed: { title: "Booking Completed", msg: `Your booking has been completed. Please leave a review!` },
    };

    if (statusMessages[status]) {
      await createNotification(
        notifyUserId,
        `reservation_${status}`,
        statusMessages[status].title,
        statusMessages[status].msg,
        { reservationId: booking._id }
      );
    }

    const listingDetails = await fetchListingDetails(booking.listingId, booking.listingModel);
    sendSuccess(res, 200, `Reservation ${status} successfully`, { ...booking.toObject(), listingDetails });
  } catch (error) {
    next(error);
  }
};

// ==================== GET SINGLE RESERVATION ====================
exports.getReservationById = async (req, res, next) => {
  try {
    const booking = await Reservation.findById(req.params.id)
      .populate("tourist", "name email avatar phone")
      .populate("provider", "name email role");

    if (!booking) return next(new AppError("Reservation not found", 404));

    const isParticipant =
      booking.tourist._id.toString() === req.user._id.toString() ||
      booking.provider._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== "admin") {
      return next(new AppError("Not authorized to view this reservation", 403));
    }

    const listingDetails = await fetchListingDetails(booking.listingId, booking.listingModel);
    sendSuccess(res, 200, "Reservation retrieved", { ...booking.toObject(), listingDetails });
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL RESERVATIONS (Admin) ====================
exports.getAllReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate("tourist", "name email avatar")
        .populate("provider", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(filter),
    ]);

    const enriched = await enrichReservations(reservations);
    sendSuccess(res, 200, "All reservations retrieved", enriched, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE RESERVATION ====================
exports.deleteReservation = async (req, res, next) => {
  try {
    const booking = await Reservation.findById(req.params.id);
    if (!booking) return next(new AppError("Reservation not found", 404));

    const isTourist = booking.tourist.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isTourist && !isAdmin) {
      return next(new AppError("Not authorized to delete this reservation", 403));
    }

    if (isTourist && !["cancelled", "completed"].includes(booking.status)) {
      return next(new AppError("Can only delete cancelled or completed reservations", 400));
    }

    await Reservation.findByIdAndDelete(req.params.id);
    sendSuccess(res, 200, "Reservation deleted successfully");
  } catch (error) {
    next(error);
  }
};
