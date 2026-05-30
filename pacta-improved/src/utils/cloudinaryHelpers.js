const cloudinary = require("cloudinary").v2;

/**
 * Delete an image from Cloudinary by its URL
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {Promise<boolean>} - True if deleted or not found, false on error
 */
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return true;

  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
    const urlParts = imageUrl.split("/upload/");
    if (urlParts.length < 2) return true;

    const pathWithVersion = urlParts[1];
    // Remove version number (starts with v followed by digits)
    const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return false;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} imageUrls - Array of Cloudinary URLs
 */
const deleteMultipleFromCloudinary = async (imageUrls) => {
  if (!Array.isArray(imageUrls)) return;

  const deletePromises = imageUrls
    .filter((url) => url && url.includes("cloudinary"))
    .map((url) => deleteFromCloudinary(url));

  await Promise.allSettled(deletePromises);
};

module.exports = { deleteFromCloudinary, deleteMultipleFromCloudinary };
