import mongoose from 'mongoose';

const tagDiscountSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, lowercase: true, trim: true, index: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

tagDiscountSchema.index({ tag: 1 }, { unique: true });

export default mongoose.models.TagDiscount || mongoose.model('TagDiscount', tagDiscountSchema);


