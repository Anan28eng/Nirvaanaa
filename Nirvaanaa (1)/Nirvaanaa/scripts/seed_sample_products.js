const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nirvaanaa');

// Product Schema (simplified for this script)
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 10 },
  category: { type: String, required: true },
  published: { type: Boolean, default: true },
  images: [{
    url: String,
    alt: String,
    publicId: String,
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    title: 'Handcrafted Leather Tote Bag',
    description: 'Beautiful handcrafted leather tote bag perfect for everyday use. Made with premium quality leather and brass hardware.',
    price: 2499,
    stock: 25,
    category: 'bags',
    images: [{
      url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
      alt: 'Leather Tote Bag',
      publicId: 'leather-tote-bag'
    }]
  },
  {
    title: 'Artisan Woven Basket',
    description: 'Traditional artisan woven basket made from natural materials. Perfect for home decoration and storage.',
    price: 899,
    stock: 15,
    category: 'home-decor',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Woven Basket',
      publicId: 'woven-basket'
    }]
  },
  {
    title: 'Handmade Ceramic Mug Set',
    description: 'Set of 4 handmade ceramic mugs with unique designs. Microwave and dishwasher safe.',
    price: 599,
    stock: 30,
    category: 'home-decor',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Ceramic Mug Set',
      publicId: 'ceramic-mug-set'
    }]
  },
  {
    title: 'Traditional Silk Scarf',
    description: 'Handwoven silk scarf with traditional Indian patterns. Lightweight and perfect for all seasons.',
    price: 1299,
    stock: 20,
    category: 'sarees',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Silk Scarf',
      publicId: 'silk-scarf'
    }]
  },
  {
    title: 'Handcrafted Wooden Jewelry Box',
    description: 'Beautiful wooden jewelry box with intricate carvings. Perfect for storing precious jewelry.',
    price: 1899,
    stock: 12,
    category: 'jewelry',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Wooden Jewelry Box',
      publicId: 'wooden-jewelry-box'
    }]
  },
  {
    title: 'Artisan Cotton Kurti',
    description: 'Handcrafted cotton kurti with traditional embroidery. Comfortable and stylish for everyday wear.',
    price: 1599,
    stock: 18,
    category: 'clothing',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Cotton Kurti',
      publicId: 'cotton-kurti'
    }]
  },
  {
    title: 'Handmade Pottery Vase',
    description: 'Unique handmade pottery vase with natural glaze. Perfect for fresh flowers or as a decorative piece.',
    price: 799,
    stock: 22,
    category: 'home-decor',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Pottery Vase',
      publicId: 'pottery-vase'
    }]
  },
  {
    title: 'Traditional Brass Diya Set',
    description: 'Set of 5 traditional brass diyas for religious ceremonies and home decoration.',
    price: 449,
    stock: 35,
    category: 'home-decor',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      alt: 'Brass Diya Set',
      publicId: 'brass-diya-set'
    }]
  }
];

async function seedSampleProducts() {
  try {
    console.log('🌱 Seeding sample products...');

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    let createdCount = 0;
    let skippedCount = 0;

    for (const productData of sampleProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ slug: productData.title.toLowerCase().replace(/\s+/g, '-') });
        
        if (existingProduct) {
          console.log(`⏭️  Skipped "${productData.title}" - already exists`);
          skippedCount++;
          continue;
        }

        // Create product with slug
        const product = new Product({
          ...productData,
          slug: productData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          published: true,
          stock: productData.stock || 10
        });

        await product.save();
        console.log(`✅ Created "${product.title}" - Stock: ${product.stock}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating "${productData.title}":`, error.message);
      }
    }

    // Show summary
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    console.log('\n📊 Product Seeding Summary:');
    console.log(`Created: ${createdCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Total Products: ${totalProducts}`);
    console.log(`In Stock: ${inStockProducts}`);
    console.log(`Out of Stock: ${outOfStockProducts}`);

    // Show stock distribution
    const stockDistribution = await Product.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$stock', 0] },
              'Out of Stock',
              {
                $cond: [
                  { $lte: ['$stock', 5] },
                  'Low Stock (1-5)',
                  {
                    $cond: [
                      { $lte: ['$stock', 15] },
                      'Medium Stock (6-15)',
                      'High Stock (16+)'
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📦 Stock Distribution:');
    stockDistribution.forEach(item => {
      console.log(`${item._id}: ${item.count} products`);
    });

    console.log('\n🎉 Product seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedSampleProducts();
