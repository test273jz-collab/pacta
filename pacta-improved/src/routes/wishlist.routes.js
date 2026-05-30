const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { validateObjectId, validatePagination } = require("../middlewares/validate.middleware");
const {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  checkWishlist,
} = require("../controllers/wishlist.controller");

router.post("/", protect, addToWishlist);
router.get("/", protect, validatePagination, getMyWishlist);
router.get("/check/:listingId", protect, checkWishlist);
router.delete("/:id", protect, validateObjectId(), removeFromWishlist);

module.exports = router;
