const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const AppError = require("../utils/AppError");

// Define folder mapping based on field name for clean organization
const getFolderTarget = (fieldname) => {
  const folderMap = {
    avatar: "pacta_uploads/avatars",
    image: "pacta_uploads/ads_categories",
    images: "pacta_uploads/listings",
  };
  return folderMap[fieldname] || "pacta_uploads/general";
};

// Configure Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine target folders based on field name for clean organization
    let folderTarget = "pacta_uploads/general";
    if (file.fieldname === "avatar") {
      folderTarget = "pacta_uploads/avatars";
    } else if (file.fieldname === "images") {
      folderTarget = "pacta_uploads/listings";
    }

    return {
      folder: folderTarget,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }], // Keeps files optimized automatically
    };
  },
});


// File filter - images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file asset type. Images only!"), false);
  }
};

// 4. Export the upload initializer pipeline
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Strict 5MB structural allocation limit guard
  },
});

// Error handling wrapper for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Maximum size is 5MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Too many files. Maximum is 10." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ success: false, message: "Unexpected field name for file upload." });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  next(err);
};

module.exports = { upload, handleUploadError };
