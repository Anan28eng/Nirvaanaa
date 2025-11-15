import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shipping method name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  cost: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative'],
  },
  gstPercent: {
    type: Number,
    min: [0, 'GST cannot be negative'],
    max: [100, 'GST cannot exceed 100%'],
    default: 18,
  },
  estimatedDays: {
    min: {
      type: Number,
      required: true,
      min: 1,
    },
    max: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  freeShippingThreshold: {
    type: Number,
    min: [0, 'Free shipping threshold cannot be negative'],
  },
  applicableRegions: [{
    type: String,
    trim: true,
  }],
  weightLimit: {
    type: Number,
    min: [0, 'Weight limit cannot be negative'],
  },
  dimensionsLimit: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm',
    },
  },
}, {
  timestamps: true,
});

// Indexes
shippingSchema.index({ isActive: 1 });
shippingSchema.index({ isDefault: 1 });
shippingSchema.index({ cost: 1 });

// Static method to find active shipping methods
shippingSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ cost: 1 });
};

// Static method to find default shipping method
shippingSchema.statics.findDefault = function() {
  return this.findOne({ isActive: true, isDefault: true });
};

// Static method to calculate shipping cost for an order
shippingSchema.statics.calculateShipping = async function(orderTotal, weight, dimensions) {
  const activeMethods = await this.findActive();
  
  if (activeMethods.length === 0) {
    return { cost: 0, method: null };
  }

  // Check for free shipping threshold
  for (const method of activeMethods) {
    if (method.freeShippingThreshold && orderTotal >= method.freeShippingThreshold) {
      return { cost: 0, method };
    }
  }

  // Check weight and dimension limits
  const applicableMethods = activeMethods.filter(method => {
    if (method.weightLimit && weight > method.weightLimit) {
      return false;
    }
    
    if (method.dimensionsLimit && dimensions) {
      const { length, width, height } = dimensions;
      const { length: maxLength, width: maxWidth, height: maxHeight } = method.dimensionsLimit;
      
      if (length > maxLength || width > maxWidth || height > maxHeight) {
        return false;
      }
    }
    
    return true;
  });

  if (applicableMethods.length === 0) {
    // Return the most expensive method if no method meets criteria
    return { cost: activeMethods[activeMethods.length - 1].cost, method: activeMethods[activeMethods.length - 1] };
  }

  // Return the cheapest applicable method
  const cheapestMethod = applicableMethods[0];
  return { cost: cheapestMethod.cost, method: cheapestMethod };
};

// Ensure virtuals are serialized
shippingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Shipping || mongoose.model('Shipping', shippingSchema);
