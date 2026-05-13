const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a base64 image to Cloudinary
 * @param {string} base64Data - The base64 string of the image
 * @param {string} folder - The folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImage = async (base64Data, folder = 'videobelajar') => {
  try {
    // If it's already a URL (e.g. from a previous upload or default image), return it as is
    if (base64Data.startsWith('http') || base64Data.startsWith('/')) {
      return base64Data;
    }

    // Ensure the base64 string has the correct prefix if it's missing
    let uploadStr = base64Data;
    if (!uploadStr.includes('data:image')) {
      // Defaulting to jpeg/png, Cloudinary usually auto-detects based on content
      uploadStr = `data:image/jpeg;base64,${base64Data}`;
    }

    const result = await cloudinary.uploader.upload(uploadStr, {
      folder: folder,
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

module.exports = { cloudinary, uploadImage };
