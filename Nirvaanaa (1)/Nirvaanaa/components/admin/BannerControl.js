import Banner from '../models/Banner.js';

export const getBanner = async (req, res) => {
  const banner = await Banner.findOne().sort({ updatedAt: -1 });
  res.json(banner || {});
};

export const updateBanner = async (req, res) => {
  const { adBanner, announcementBanner } = req.body;
  const updated = await Banner.findOneAndUpdate(
    {},
    { adBanner, announcementBanner },
    { upsert: true, new: true }
  );
  res.json(updated);
};
