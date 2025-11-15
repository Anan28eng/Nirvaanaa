/**
 * Migration Script: Change 'accessories' category to 'sarees'
 * 
 * This script updates all products in the database with category 'accessories' 
 * to have category 'sarees' instead.
 * 
 * Run this script using: node scripts/migrate_accessories_to_sarees.js
 */

import dbConnect from '../lib/mongodb.js';
import Product from '../models/Product.js';

async function migrateAccessoriesToSarees() {
  try {
    console.log('🔄 Starting migration: accessories → sarees');
    
    // Connect to database
    await dbConnect();
    console.log('✅ Connected to database');

    // Find all products with category 'accessories'
    const productsToUpdate = await Product.find({ category: 'accessories' });
    console.log(`📦 Found ${productsToUpdate.length} products with category 'accessories'`);

    if (productsToUpdate.length === 0) {
      console.log('✨ No products to update. Migration complete!');
      process.exit(0);
    }

    // Update all products
    const updateResult = await Product.updateMany(
      { category: 'accessories' },
      { $set: { category: 'sarees' } }
    );

    console.log(`✅ Successfully updated ${updateResult.modifiedCount} products`);
    console.log('✨ Migration complete!');
    
    // Verify the update
    const remainingAccessories = await Product.find({ category: 'accessories' });
    if (remainingAccessories.length > 0) {
      console.warn(`⚠️  Warning: ${remainingAccessories.length} products still have category 'accessories'`);
    } else {
      console.log('✅ Verification: No products with category "accessories" remain');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateAccessoriesToSarees();

