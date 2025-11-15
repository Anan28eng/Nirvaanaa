import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    
    maxlength: [200, 'Text cannot be more than 200 characters'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['announcement', 'adbanner'],
    default: 'announcement',
    required: true,
  },
  isAnnouncementActive: {
    type: Boolean,
    default: false,
  },
  isAdBannerActive: {
    type: Boolean,
    default: false,
  },
  backgroundColor: {
    type: String,
    default: '#f59e0b',
    match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color'],
  },
  textColor: {
    type: String,
    default: '#ffffff',
    match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color'],
  },
  link: {
    url: String,
    text: String,
  },
  image: {
    type: String,
    required: false,
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
announcementSchema.index({ isAnnouncementActive: 1 });
announcementSchema.index({ isAdBannerActive: 1 });
announcementSchema.index({ priority: -1 });
announcementSchema.index({ startDate: 1, endDate: 1 });

// Virtual for is currently active (announcement)
announcementSchema.virtual('isAnnouncementCurrentlyActive').get(function() {
  if (!this.isAnnouncementActive) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

// Virtual for is currently active (adbanner)
announcementSchema.virtual('isAdBannerCurrentlyActive').get(function() {
  if (!this.isAdBannerActive) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

// Static method to find active announcement banner
announcementSchema.statics.findAnnouncementBanner = function() {
  const now = new Date();
  return this.findOne({
    type: 'announcement',
    isAnnouncementActive: true,
    $and: [
      { $or: [ { startDate: { $lte: now } }, { startDate: { $exists: false } } ] },
      { $or: [ { endDate: { $gte: now } }, { endDate: { $exists: false } } ] },
    ],
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to find active adbanner
announcementSchema.statics.findAdBanner = function() {
  const now = new Date();
  return this.findOne({
    type: 'adbanner',
    isAdBannerActive: true,
    $and: [
      { $or: [ { startDate: { $lte: now } }, { startDate: { $exists: false } } ] },
      { $or: [ { endDate: { $gte: now } }, { endDate: { $exists: false } } ] },
    ],
  }).sort({ priority: -1, createdAt: -1 });
};

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
