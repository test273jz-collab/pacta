const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for authenticated user
 * @param {string} userId - MongoDB user document ID
 * @param {string} role - User role for route-level access control
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role = "tourist") => {
  if (!userId) {
    throw new Error("User ID is required for token generation");
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );
};

module.exports = generateToken;
