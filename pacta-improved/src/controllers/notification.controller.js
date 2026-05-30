const Notification = require("../models/notification.model");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== GET MY NOTIFICATIONS ====================
exports.getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { recipient: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    sendSuccess(res, 200, "Notifications retrieved", notifications, {
      ...getPaginationMeta(parseInt(page), parseInt(limit), total),
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MARK AS READ ====================
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) return next(new AppError("Notification not found", 404));

    sendSuccess(res, 200, "Notification marked as read", notification);
  } catch (error) {
    next(error);
  }
};

// ==================== MARK ALL AS READ ====================
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    sendSuccess(res, 200, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE NOTIFICATION ====================
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) return next(new AppError("Notification not found", 404));

    sendSuccess(res, 200, "Notification deleted");
  } catch (error) {
    next(error);
  }
};
