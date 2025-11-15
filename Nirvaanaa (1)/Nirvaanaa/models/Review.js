import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    trim: true, 
    maxlength: 1000 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  helpful: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
}, { 
  timestamps: true 
});

// Index for efficient queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per user per product

// Virtual for average rating
reviewSchema.virtual('productRating', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
