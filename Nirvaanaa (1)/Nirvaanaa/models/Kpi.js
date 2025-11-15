import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

kpiSchema.index({ createdAt: -1 });

export default mongoose.models.Kpi || mongoose.model('Kpi', kpiSchema);
