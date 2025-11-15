import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import products from '../utils/seedProduct.js';
import Product from '../models/Product.js';

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');
    
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable in .env.local');
    }
    
    await connect(MONGODB_URI);
    console.log('✅ Connected to database');

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each product
    for (const productData of products) {
      try {
        // Generate slug from title if not provided
        const slug = productData.slug || productData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');

        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          $or: [
            { slug },
            { sku: productData.sku }
          ]
        });

        // Prepare product data
        const productToSave = {
          ...productData,
          slug,
          // Ensure images array has proper structure
          images: (productData.images || []).map(img => {
            if (typeof img === 'string') {
              return {
                url: img,
                alt: productData.title,
                publicId: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              };
            }
            return {
              url: img.url || img,
              alt: img.alt || productData.title,
              publicId: img.publicId || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
          }),
          // Ensure colorVariants have proper structure
          colorVariants: (productData.colorVariants || []).map(variant => ({
            name: variant.name,
            hex: variant.hex,
            images: Array.isArray(variant.images) ? variant.images : []
          })),
          // Set defaults
          published: productData.published !== undefined ? productData.published : true,
          discount: productData.discount || 0,
          stock: productData.stock || 10,
          ratings: productData.ratings || { average: 0, count: 0 },
          salesCount: productData.salesCount || 0,
        };

        if (existingProduct) {
          // Update existing product
          Object.assign(existingProduct, productToSave);
          await existingProduct.save();
          console.log(`🔄 Updated "${productData.title}"`);
          updatedCount++;
        } else {
          // Create new product
          const product = new Product(productToSave);
          await product.save();
          console.log(`✅ Created "${productData.title}" - Stock: ${product.stock}, Colors: ${product.colorVariants?.length || 0}`);
          createdCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing "${productData.title}":`, error.message);
        errorCount++;
      }
    }

    // Show summary
    const totalProducts = await Product.countDocuments();
    const publishedProducts = await Product.countDocuments({ published: true });
    const featuredProducts = await Product.countDocuments({ featured: true });
    const inStockProducts = await Product.countDocuments({ stock: { $gt: 0 } });

    console.log('\n📊 Product Seeding Summary:');
    console.log(`✅ Created: ${createdCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`\n📦 Database Status:`);
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Published: ${publishedProducts}`);
    console.log(`   Featured: ${featuredProducts}`);
    console.log(`   In Stock: ${inStockProducts}`);

    // Show category distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📂 Category Distribution:');
    categoryDistribution.forEach(item => {
      console.log(`   ${item._id}: ${item.count} products`);
    });

    // Show products with color variants
    const productsWithColors = await Product.countDocuments({
      colorVariants: { $exists: true, $ne: [] }
    });
    console.log(`\n🎨 Products with color variants: ${productsWithColors}`);

    console.log('\n🎉 Product seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await disconnect();
  }
}

// Run if called directly
seedProducts()
  .then(() => {
    console.log('✅ Seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding script failed:', error);
    process.exit(1);
  });

export default seedProducts;

