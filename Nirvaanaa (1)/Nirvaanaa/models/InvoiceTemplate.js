import mongoose from 'mongoose';

const invoiceTemplateSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
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

invoiceTemplateSchema.index({ uploadedAt: -1 });

export default mongoose.models.InvoiceTemplate || mongoose.model('InvoiceTemplate', invoiceTemplateSchema);


