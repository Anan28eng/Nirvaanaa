import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  productRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true,
  },
  excerpt: {
    type: String,
    required: [true, 'Post excerpt is required'],
    maxlength: [300, 'Excerpt cannot be more than 300 characters'],
    trim: true,
  },
  content: {
    type: String,
    maxlength: [2000, 'Content cannot be more than 2000 characters'],
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
    caption: String,
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
  scheduledFor: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
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
}, {
  timestamps: true,
});

// Indexes for efficient queries
postSchema.index({ productRef: 1 });
postSchema.index({ isPublished: 1 });
postSchema.index({ featured: 1 });
postSchema.index({ postedAt: -1 });
postSchema.index({ scheduledFor: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdBy: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for is currently published
postSchema.virtual('isCurrentlyPublished').get(function() {
  if (!this.isPublished) return false;
  
  const now = new Date();
  if (this.scheduledFor && now < this.scheduledFor) return false;
  
  return true;
});

// Instance method to add like
postSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.userId.toString() === userId.toString());
  if (!existingLike) {
    this.likes.push({ userId });
  }
  return this.save();
};

// Instance method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.userId.toString() !== userId.toString());
  return this.save();
};

// Instance method to add comment
postSchema.methods.addComment = function(userId, text) {
  this.comments.push({ userId, text });
  return this.save();
};

// Instance method to remove comment
postSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return this.save();
};

// Static method to find published posts
postSchema.statics.findPublished = function() {
  const now = new Date();
  return this.find({
    isPublished: true,
    $or: [
      { scheduledFor: { $lte: now } },
      { scheduledFor: { $exists: false } },
    ],
  }).sort({ postedAt: -1 });
};

// Static method to find featured posts
postSchema.statics.findFeatured = function() {
  const now = new Date();
  return this.find({
    isPublished: true,
    featured: true,
    $or: [
      { scheduledFor: { $lte: now } },
      { scheduledFor: { $exists: false } },
    ],
  }).sort({ postedAt: -1 });
};

// Static method to find by product
postSchema.statics.findByProduct = function(productId) {
  const now = new Date();
  return this.find({
    productRef: productId,
    isPublished: true,
    $or: [
      { scheduledFor: { $lte: now } },
      { scheduledFor: { $exists: false } },
    ],
  }).sort({ postedAt: -1 });
};

// Static method to find scheduled posts
postSchema.statics.findScheduled = function() {
  const now = new Date();
  return this.find({
    isPublished: true,
    scheduledFor: { $gt: now },
  }).sort({ scheduledFor: 1 });
};

// Pre-save middleware to set postedAt if publishing
postSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.postedAt) {
    this.postedAt = new Date();
  }
  next();
});

// Ensure virtuals are serialized
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Post || mongoose.model('Post', postSchema);
