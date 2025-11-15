import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload file to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {string} folder - Cloudinary folder name
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} Upload result with url, publicId, etc.
 */
export const uploadImage = async (file, folder = 'nirvaanaa', options = {}) => {
  try {
    // Determine if file is a buffer or path
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      ...options,
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Generate optimized URL
export const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  const transformations = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`,
  ];

  if (height) {
    transformations.push(`h_${height}`);
  }

  return cloudinary.url(publicId, {
    transformation: transformations.join(','),
    secure: true,
  });
};
