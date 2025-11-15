import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters'],
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  }],
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  // Discount percentage (0-100)
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%'],
    default: 0,
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 10,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'bangle-box',
      'clutch',
      'gift-hampers',
      'goggle-cover',
      'kitty-bag',
      'long-tote-bag',
      'picnic-bag',
      'potli-purse',
      'sling-bags',
      'velvet-clutch-with-flaps'
    ],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  materials: [{
    type: String,
    trim: true,
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm',
    },
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg', 'lbs'],
      default: 'g',
    },
  },
  colors: [{
    name: String,
    hex: String,
  }],
  colorVariants: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hex: {
      type: String,
      required: true,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Hex color must be in format #RRGGBB'],
    },
    images: [{
      type: String,
      trim: true,
    }],
  }],
  published: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot be more than 60 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters'],
    },
    keywords: [String],
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  salesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isHandmade: {
    type: Boolean,
    default: true,
  },
  madeIn: {
    type: String,
    default: 'India',
  },
  careInstructions: {
    type: String,
    maxlength: [500, 'Care instructions cannot be more than 500 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ published: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});


// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});


// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  return this.images.length > 0 ? this.images[0] : null;
});

// Instance method to update stock
productSchema.methods.updateStock = function(quantity) {
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

// Instance method to increment sales count
productSchema.methods.incrementSales = function(quantity = 1) {
  this.salesCount += quantity;
  return this.save();
};

// Static method to find published products
productSchema.statics.findPublished = function() {
  return this.find({ published: true });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ published: true, featured: true });
};

// Static method to find by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ published: true, category });
};

// Static method to search products
productSchema.statics.search = function(query) {
  return this.find({
    published: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ],
  });
};

// Pre-save middleware to generate slug if not provided
productSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Ensure virtuals are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
