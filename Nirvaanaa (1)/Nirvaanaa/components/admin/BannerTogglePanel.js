"use client"
import React, { useState } from 'react';
import { useBanner } from './BannerContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function BannerTogglePanel() {
  const { adBanner, announcementBanner, toggleBanner, loading } = useBanner();
  const [adText, setAdText] = useState(adBanner?.text || '');
  const [annImage, setAnnImage] = useState(announcementBanner?.image || '');

  // sync local inputs when banners change
  React.useEffect(() => { setAdText(adBanner?.text || ''); }, [adBanner?.text]);
  React.useEffect(() => { setAnnImage(announcementBanner?.image || ''); }, [announcementBanner?.image]);

  const handleAdToggle = async () => {
    if (!adBanner?._id) return toast.error('No ad banner available');
    await toggleBanner({ id: adBanner._id, type: 'ad', visible: !adBanner.isAdBannerActive, content: adText });
  };

  const handleAnnToggle = async () => {
    if (!announcementBanner?._id) return toast.error('No announcement available');
    await toggleBanner({ id: announcementBanner._id, type: 'announcement', visible: !announcementBanner.isAnnouncementActive, content: annImage });
  };

  return (
    <div className="w-full max-w-5xl glassmorphism p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-xl mb-3">Banner Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Ad Banner</h3>
          <input className="w-full p-2 border rounded mb-2" placeholder="Ad text" value={adText} onChange={e => setAdText(e.target.value)} />
          <div className="flex items-center gap-2">
            <button disabled={loading} onClick={handleAdToggle} className="px-3 py-1 bg-[#bfae9e] text-white rounded">{adBanner?.isAdBannerActive ? 'Disable' : 'Enable'}</button>
            <button disabled={loading || !adBanner?._id} onClick={() => toggleBanner({ id: adBanner._id, type: 'ad', visible: Boolean(adBanner?.isAdBannerActive), content: adText })} className="px-3 py-1 border rounded">Save</button>
          </div>
          <div className="mt-3 text-xs text-muted">Status: {adBanner ? (adBanner.isAdBannerActive ? 'Active' : 'Inactive') : 'No banner'}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Announcement Banner</h3>
          <input className="w-full p-2 border rounded mb-2" placeholder="Image URL" value={annImage} onChange={e => setAnnImage(e.target.value)} />
          <div className="flex items-center gap-2">
            <button disabled={loading} onClick={handleAnnToggle} className="px-3 py-1 bg-[#bfae9e] text-white rounded">{announcementBanner?.isAnnouncementActive ? 'Disable' : 'Enable'}</button>
            <button disabled={loading || !announcementBanner?._id} onClick={() => toggleBanner({ id: announcementBanner._id, type: 'announcement', visible: Boolean(announcementBanner?.isAnnouncementActive), content: annImage })} className="px-3 py-1 border rounded">Save</button>
          </div>
          <div className="mt-3 text-xs text-muted">Status: {announcementBanner ? (announcementBanner.isAnnouncementActive ? 'Active' : 'Inactive') : 'No banner'}</div>
        </motion.div>
      </div>
    </div>
  );
}
