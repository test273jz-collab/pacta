const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

/**
 * Validate MongoDB ObjectId in request parameters
 */
exports.validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }
    next();
  };
};

/**
 * Validate required fields in request body
 * @param {string[]} fields - Required field names
 * @param {string} method - HTTP method to apply validation (optional)
 */
exports.validateRequired = (fields, method = null) => {
  return (req, res, next) => {
    if (method && req.method !== method) {
      return next();
    }

    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missing.length > 0) {
      return next(new AppError(`Missing required fields: ${missing.join(", ")}`, 400));
    }
    next();
  };
};

/**
 * Sanitize request body to prevent NoSQL injection
 */
exports.sanitizeBody = (req, res, next) => {
  if (req.body) {
    // Remove MongoDB operator keys
    const sanitize = (obj) => {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};

/**
 * Validate date range for reservations
 */
exports.validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(new AppError("Both startDate and endDate are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(new AppError("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)", 400));
  }

  if (start < now) {
    return next(new AppError("Start date cannot be in the past", 400));
  }

  if (end <= start) {
    return next(new AppError("End date must be after start date", 400));
  }

  // Maximum booking duration: 90 days
  const maxDuration = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  if (end.getTime() - start.getTime() > maxDuration) {
    return next(new AppError("Maximum booking duration is 90 days", 400));
  }

  next();
};

/**
 * Validate pagination query parameters
 */
exports.validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  if (page < 1) {
    return next(new AppError("Page must be at least 1", 400));
  }

  if (limit < 1 || limit > 100) {
    return next(new AppError("Limit must be between 1 and 100", 400));
  }

  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};
