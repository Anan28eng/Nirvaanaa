const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Product Schema (simplified for this script)
const productSchema = new mongoose.Schema({
  title: String,
  stock: { type: Number, default: 10 },
  published: { type: Boolean, default: true },
  price: Number,
  category: String,
  slug: String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function fixProductStock() {
  try {
    console.log('🔍 Checking product stock...');
    
    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      
      // Check if stock is undefined, null, or less than 0
      if (product.stock === undefined || product.stock === null || product.stock < 0) {
        product.stock = 10;
        needsUpdate = true;
        console.log(`📦 Fixed stock for "${product.title}" - set to 10`);
      }
      
      // Check if published is undefined or null
      if (product.published === undefined || product.published === null) {
        product.published = true;
        needsUpdate = true;
        console.log(`✅ Fixed published status for "${product.title}" - set to true`);
      }
      
      if (needsUpdate) {
        await product.save();
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} products`);
    
    // Show summary
    const stockSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          inStock: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          avgStock: { $avg: '$stock' }
        }
      }
    ]);
    
    if (stockSummary.length > 0) {
      const summary = stockSummary[0];
      console.log('\n📊 Stock Summary:');
      console.log(`Total Products: ${summary.totalProducts}`);
      console.log(`In Stock: ${summary.inStock}`);
      console.log(`Out of Stock: ${summary.outOfStock}`);
      console.log(`Average Stock: ${Math.round(summary.avgStock)}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing product stock:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixProductStock();
