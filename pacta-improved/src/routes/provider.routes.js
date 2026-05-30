const express = require("express");
const router = express.Router();
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const { getListings, getListingById, getListingByCategory } = require("../controllers/provider.controller");

// Unified polymorphic listing routes
router.get("/", validatePagination, getListings);
router.get("/:id", validateObjectId(), getListingById);
router.get("/category/:category", validatePagination, getListingByCategory);


module.exports = router;
