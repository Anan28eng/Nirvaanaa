import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active',
  },
  lastEmailSent: {
    type: Date,
  },
  preferences: {
    type: Map,
    of: Boolean,
    default: {
      productUpdates: true,
      promotions: true,
      newArrivals: true
    }
  }
});

// Add indexes for better query performance
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ status: 1 });

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
