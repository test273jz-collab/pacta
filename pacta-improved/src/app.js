const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");

const errorHandler = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const { sanitizeBody } = require("./middlewares/validate.middleware");

// Import routes
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const categoryRoutes = require("./routes/category.routes");
const adRoutes = require("./routes/ad.routes");
const hotelRoutes = require("./routes/hotel.routes");
const rentalRoutes = require("./routes/rental.routes");
const resortRoutes = require("./routes/resort.routes");
const guideRoutes = require("./routes/guide.routes");
const providerRoutes = require("./routes/provider.routes");
const reservationRoutes = require("./routes/reservation.routes");
const reviewRoutes = require("./routes/review.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const notificationRoutes = require("./routes/notification.routes");
const contactRoutes = require("./routes/contact.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production",
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["https://pacta-wtsz.vercel.app/", "http://localhost:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));


// Data sanitization against NoSQL injection
app.use(mongoSanitize());
app.use(sanitizeBody);

// Data sanitization against XSS
app.use(xss());

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting on all API routes
app.use("/api", apiLimiter);

// ==================== ROUTES ====================

// Auth & Profile
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Content Management
app.use("/api/categories", categoryRoutes);
app.use("/api/ads", adRoutes);

// Individual Listing Types
app.use("/api/hotels", hotelRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/resorts", resortRoutes);
app.use("/api/guides", guideRoutes);

// Unified Provider Listings
app.use("/api/providers", providerRoutes);

// Reservations & Reviews
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);

// User Features
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);

// Contact & Support
app.use("/api/contact", contactRoutes);

// Admin Analytics
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pacta API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API root
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Pacta Tourism Platform API",
    version: "2.0.0",
    documentation: "/health",
  });
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalPath || req.path}`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
