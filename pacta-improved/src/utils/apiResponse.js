/**
 * Standardized API response formatter
 * Ensures consistent response structure across all endpoints
 */

/**
 * Success response formatter
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object|null} data - Response payload
 * @param {object|null} meta - Pagination/metadata info
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response formatter
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object|null} errors - Detailed validation errors
 */
const sendError = (res, statusCode = 500, message = "Internal server error", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null && process.env.NODE_ENV === "development") {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
