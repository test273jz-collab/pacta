const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  createRental,
  getRentals,
  getRentalById,
  updateRental,
  deleteRental,
  toggleRentalStatus,
  getMyRentals,
} = require("../controllers/rental.controller");

// Public routes
router.get("/", validatePagination, getRentals);
router.get("/:id", validateObjectId(), getRentalById);

// Protected provider routes
router.post("/", protect, createRental);
router.get("/my/listings", protect, getMyRentals);
router.put("/:id", protect, validateObjectId(), updateRental);
router.delete("/:id", protect, validateObjectId(), deleteRental);
router.patch("/:id/toggle", protect, validateObjectId(), toggleRentalStatus);

module.exports = router;
