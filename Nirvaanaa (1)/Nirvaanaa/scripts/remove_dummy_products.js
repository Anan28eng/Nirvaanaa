/**
 * Remove Dummy Seeded Products from MongoDB
 * 
 * This script removes all products that were created by seed scripts.
 * It identifies dummy products by checking for common patterns in:
 * - Product titles (from seed scripts)
 * - Image URLs (placeholder/demo URLs)
 * - SKU patterns
 * 
 * Usage:
 *   node scripts/remove_dummy_products.js
 * 
 * Options:
 *   --dry-run    : Preview what will be deleted without actually deleting
 *   --confirm    : Skip confirmation prompt
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Product Schema (simplified for this script)
const productSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  sku: String,
  images: [{
    url: String,
    alt: String,
    publicId: String,
  }],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Patterns to identify dummy products
const DUMMY_PATTERNS = {
  titles: [
    /embroidered tote bag/i,
    /zari work clutch/i,
    /embroidered wallet/i,
    /mirror work pouch/i,
    /kantha stitch/i,
    /handcrafted leather tote/i,
    /artisan woven basket/i,
    /handmade ceramic mug/i,
    /traditional silk scarf/i,
    /handcrafted wooden jewelry/i,
    /artisan cotton kurti/i,
    /handmade pottery vase/i,
    /traditional brass diya/i,
  ],
  imageUrls: [
    /res\.cloudinary\.com\/demo/i,
    /images\.unsplash\.com/i,
    /placeholder/i,
    /demo/i,
    /example\.com/i,
  ],
  skus: [
    /^ETB\d+$/i,
    /^ZWC\d+$/i,
    /^EW\d+$/i,
    /^MWP\d+$/i,
    /^KSSB\d+$/i,
  ],
};

function isDummyProduct(product) {
  // Check title patterns
  if (DUMMY_PATTERNS.titles.some(pattern => pattern.test(product.title))) {
    return true;
  }

  // Check image URLs
  if (product.images && product.images.length > 0) {
    const hasDummyImage = product.images.some(img => 
      DUMMY_PATTERNS.imageUrls.some(pattern => pattern.test(img.url || ''))
    );
    if (hasDummyImage) return true;
  }

  // Check SKU patterns
  if (product.sku && DUMMY_PATTERNS.skus.some(pattern => pattern.test(product.sku))) {
    return true;
  }

  return false;
}

async function removeDummyProducts(options = {}) {
  const { dryRun = false, confirm = false } = options;

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products
    const allProducts = await Product.find({});
    console.log(`📦 Total products in database: ${allProducts.length}\n`);

    // Identify dummy products
    const dummyProducts = allProducts.filter(isDummyProduct);
    
    if (dummyProducts.length === 0) {
      console.log('✨ No dummy products found. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    console.log(`🔍 Found ${dummyProducts.length} dummy product(s) to remove:\n`);
    
    // Display products that will be removed
    dummyProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   SKU: ${product.sku || 'N/A'}`);
      console.log(`   Category: ${product.category || 'N/A'}`);
      console.log(`   Stock: ${product.stock || 0}`);
      console.log('');
    });

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No products were deleted');
      console.log(`Would delete ${dummyProducts.length} product(s)`);
      await mongoose.disconnect();
      return;
    }

    // Confirm deletion
    if (!confirm) {
      console.log('⚠️  This will permanently delete the products listed above.');
      console.log('   Run with --confirm flag to skip this prompt');
      console.log('   Run with --dry-run to preview without deleting\n');
      
      // In a real implementation, you might want to use readline for interactive confirmation
      // For now, we'll require the --confirm flag
      console.log('❌ Deletion cancelled. Use --confirm flag to proceed.');
      await mongoose.disconnect();
      return;
    }

    // Delete dummy products
    const productIds = dummyProducts.map(p => p._id);
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    console.log(`\n✅ Successfully deleted ${result.deletedCount} dummy product(s)`);
    
    // Show remaining products
    const remainingProducts = await Product.countDocuments();
    console.log(`📦 Remaining products in database: ${remainingProducts}\n`);

    // Show summary by category
    const categorySummary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    if (categorySummary.length > 0) {
      console.log('📊 Products by category:');
      categorySummary.forEach(item => {
        console.log(`   ${item._id || 'Uncategorized'}: ${item.count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error removing dummy products:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  confirm: args.includes('--confirm'),
};

// Run the script
if (require.main === module) {
  removeDummyProducts(options)
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeDummyProducts, isDummyProduct };

