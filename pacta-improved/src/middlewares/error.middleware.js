const AppError = require("../utils/AppError");

/**
 * Handle specific Mongoose validation errors
 */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((val) => val.message);
  return new AppError(`Validation Error: ${messages.join(". ")}`, 400);
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Duplicate value: '${value}' for field '${field}'. Please use a different value.`, 409);
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  return new AppError(`Invalid value for field '${err.path}': ${err.value}`, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError("Invalid token. Please log in again.", 401);
const handleJWTExpired = () => new AppError("Your session has expired. Please log in again.", 401);

/**
 * Global error handler middleware
 * Must have 4 parameters for Express to recognize it as error middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });
  }

  let error = { ...err, message: err.message };

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    error = handleCastError(err);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }
  if (err.name === "TokenExpiredError") {
    error = handleJWTExpired();
  }

  // Multer errors
  if (err.name === "MulterError") {
    error = new AppError(`File upload error: ${err.message}`, 400);
  }

  // Build response
  const response = {
    success: false,
    message: error.message || "Internal server error",
  };

  // Include error details in development
  if (process.env.NODE_ENV === "development") {
    response.error = {
      statusCode: error.statusCode,
      status: error.status,
      stack: err.stack,
      ...(err.errors && { details: err.errors }),
    };
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
