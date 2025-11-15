import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['defective', 'wrong-item', 'not-as-described', 'changed-mind', 'other'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending',
  },
  returnReason: {
    type: String,
    required: true,
    maxlength: [500, 'Return reason cannot be more than 500 characters'],
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundMethod: {
    type: String,
    enum: ['original-payment', 'store-credit', 'bank-transfer'],
    default: 'original-payment',
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters'],
  },
  trackingNumber: {
    type: String,
  },
  returnInstructions: {
    type: String,
    default: 'Please package the items securely and send them to our return address. Include the return slip with your package.',
  },
}, {
  timestamps: true,
});

// Indexes
returnSchema.index({ orderId: 1 });
returnSchema.index({ userId: 1 });
returnSchema.index({ status: 1 });
returnSchema.index({ createdAt: -1 });

// Virtual for total items count
returnSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Instance method to calculate refund amount
returnSchema.methods.calculateRefund = function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Static method to find returns by user
returnSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).populate('orderId').sort({ createdAt: -1 });
};

// Static method to find returns by status
returnSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('orderId').populate('userId').sort({ createdAt: -1 });
};

// Pre-save middleware to calculate refund amount
returnSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.refundAmount = this.calculateRefund();
  }
  next();
});

// Ensure virtuals are serialized
returnSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Return || mongoose.model('Return', returnSchema);
