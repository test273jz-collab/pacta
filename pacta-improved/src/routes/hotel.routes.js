const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  toggleHotelStatus,
  getMyHotels,
} = require("../controllers/hotel.controller");

// Public routes
router.get("/", validatePagination, getHotels);
router.get("/:id", validateObjectId(), getHotelById);

// Protected provider routes
router.post("/", protect, createHotel);
router.get("/my/listings", protect, getMyHotels);
router.put("/:id", protect, validateObjectId(), updateHotel);
router.delete("/:id", protect, validateObjectId(), deleteHotel);
router.patch("/:id/toggle", protect, validateObjectId(), toggleHotelStatus);

module.exports = router;
