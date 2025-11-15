/**
 * Cloudinary Upload Script
 * 
 * This script helps upload images/files to Cloudinary
 * 
 * Usage:
 *   node scripts/upload_to_cloudinary.js <file_path> [folder_name]
 * 
 * Example:
 *   node scripts/upload_to_cloudinary.js ./uploads/product.jpg products
 *   node scripts/upload_to_cloudinary.js ./uploads/invoice.pdf invoices
 */

require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Cloudinary folder name (default: 'nirvaanaa')
 * @param {object} options - Additional upload options
 */
async function uploadToCloudinary(filePath, folder = 'nirvaanaa', options = {}) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Determine resource type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let resourceType = 'auto';
    if (['.pdf', '.doc', '.docx'].includes(ext)) {
      resourceType = 'raw';
    } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
      resourceType = 'video';
    }

    console.log(`Uploading ${filePath} to Cloudinary...`);
    console.log(`Folder: ${folder}`);
    console.log(`Resource Type: ${resourceType}`);

    // Upload file
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options,
    });

    console.log('\n✅ Upload successful!');
    console.log('📦 Public ID:', result.public_id);
    console.log('🔗 URL:', result.secure_url);
    console.log('📏 Size:', `${(result.bytes / 1024).toFixed(2)} KB`);
    
    if (result.width && result.height) {
      console.log('📐 Dimensions:', `${result.width}x${result.height}`);
    }

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
}

/**
 * Upload multiple files
 * @param {string[]} filePaths - Array of file paths
 * @param {string} folder - Cloudinary folder name
 */
async function uploadMultiple(filePaths, folder = 'nirvaanaa') {
  const results = [];
  for (const filePath of filePaths) {
    try {
      const result = await uploadToCloudinary(filePath, folder);
      results.push({ filePath, success: true, ...result });
    } catch (error) {
      results.push({ filePath, success: false, error: error.message });
    }
  }
  return results;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node scripts/upload_to_cloudinary.js <file_path> [folder_name]

Examples:
  node scripts/upload_to_cloudinary.js ./uploads/product.jpg products
  node scripts/upload_to_cloudinary.js ./uploads/invoice.pdf invoices
  node scripts/upload_to_cloudinary.js ./uploads/banner.png banners

Environment Variables Required:
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
    `);
    process.exit(1);
  }

  const filePath = args[0];
  const folder = args[1] || 'nirvaanaa';

  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary credentials not found in environment variables.');
    console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local');
    process.exit(1);
  }

  uploadToCloudinary(filePath, folder)
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { uploadToCloudinary, uploadMultiple };

