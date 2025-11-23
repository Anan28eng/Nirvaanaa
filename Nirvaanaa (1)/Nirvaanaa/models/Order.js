import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
   // required: true,
    unique: true,
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
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    sku: String,
    colorVariant: {
      name: String,
      hex: String,
      images: [String],
    },
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true,
  },
  razorpayOrderId: {
    type: String,
    sparse: true,
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
    },
  },
  billingAddress: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: 'India',
    },
  },
  shippingMethod: {
    name: {
      type: String,
      required: true,
      default: 'Standard Shipping',
    },
    estimatedDays: {
      type: Number,
      required: true,
      default: 5,
    },
    trackingNumber: String,
    trackingUrl: String,
  },
  notes: {
    customer: String,
    admin: String,
  },
  timeline: [{
    status: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  emailSent: {
    confirmation: {
      type: Boolean,
      default: false,
    },
    shipped: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  smsSent: {
    confirmation: {
      type: Boolean,
      default: false,
    },
    shipped: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  refundAmount: {
    type: Number,
    min: 0,
  },
  refundReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deliveredAt: Date,
}, {
  timestamps: true,
});

// Indexes for efficient queries
// Note: orderNumber, razorpayOrderId, and razorpayPaymentId already have indexes from unique:true and sparse:true
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.phone': 1 });

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return {
    orderNumber: this.orderNumber,
    total: this.total,
    status: this.status,
    itemCount: this.items.length,
    createdAt: this.createdAt,
  };
});

// Virtual for customer info
orderSchema.virtual('customerInfo').get(function() {
  return {
    name: this.shippingAddress.name,
    phone: this.shippingAddress.phone,
    email: this.userId?.email,
  };
});

// Instance method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, message, updatedBy = null) {
  this.timeline.push({
    status,
    message,
    timestamp: new Date(),
    updatedBy,
  });
  return this.save();
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, message, updatedBy = null) {
  this.status = newStatus;
  this.addTimelineEntry(newStatus, message, updatedBy);
  
  // Set deliveredAt if status is delivered
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }
  
  // Set cancelledAt if status is cancelled
  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  return this.save();
};

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
  return this.save();
};

// Static method to generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get count of orders today
  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  
  const todayOrders = await this.countDocuments({
    createdAt: { $gte: todayStart, $lt: todayEnd }
  });
  
  const sequence = (todayOrders + 1).toString().padStart(3, '0');
  return `NV${year}${month}${day}${sequence}`;
};

// Static method to find by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find pending orders
orderSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Static method to find by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await this.constructor.generateOrderNumber();
  }
  next();
});

// Ensure virtuals are serialized
orderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
