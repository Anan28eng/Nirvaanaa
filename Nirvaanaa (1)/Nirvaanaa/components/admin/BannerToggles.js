'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useBanner } from './BannerContext';

export default function BannerToggles() {
  const { adBanner, announcementBanner, toggleBanner, loading } = useBanner();
  const [adTextInput, setAdTextInput] = useState('');
  const [annImageInput, setAnnImageInput] = useState('');

  useEffect(() => { setAdTextInput(adBanner?.text || ''); }, [adBanner?.text]);
  useEffect(() => { setAnnImageInput(announcementBanner?.image || ''); }, [announcementBanner?.image]);

  const handleToggleAd = async () => {
    if (!adBanner?._id) return toast.error('No ad banner');
    await toggleBanner({ id: adBanner._id, type: 'ad', visible: !adBanner.isAdBannerActive, content: adTextInput });
  };

  const handleToggleAnnouncement = async () => {
    if (!announcementBanner?._id) return toast.error('No announcement banner');
    await toggleBanner({ id: announcementBanner._id, type: 'announcement', visible: !announcementBanner.isAnnouncementActive, content: annImageInput });
  };

  const handleSaveAdText = async () => {
    if (!adBanner?._id) return toast.error('No ad banner');
    await toggleBanner({ id: adBanner._id, type: 'ad', visible: Boolean(adBanner.isAdBannerActive), content: adTextInput });
  };

  const handleSaveAnnImage = async () => {
    if (!announcementBanner?._id) return toast.error('No announcement banner');
    await toggleBanner({ id: announcementBanner._id, type: 'announcement', visible: Boolean(announcementBanner.isAnnouncementActive), content: annImageInput });
  };

  return (
    <div>
      <h2>Banner Toggles</h2>
      {adBanner && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <strong>Ad Banner:</strong>
            <button disabled={loading} onClick={handleToggleAd}>{adBanner.isAdBannerActive ? 'Disable' : 'Enable'}</button>
          </div>
          <div className="mb-2">
            <input className="p-2 border rounded w-full" value={adTextInput} onChange={e => setAdTextInput(e.target.value)} placeholder="Marquee text" />
            <button className="mt-2 px-3 py-1 bg-[#bfae9e] text-white rounded" onClick={handleSaveAdText} disabled={loading}>Save Text</button>
          </div>
        </div>
      )}
      {announcementBanner && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <strong>Announcement Banner:</strong>
            <button disabled={loading} onClick={handleToggleAnnouncement}>{announcementBanner.isAnnouncementActive ? 'Disable' : 'Enable'}</button>
          </div>
          <div className="mb-2">
            <input className="p-2 border rounded w-full" value={annImageInput} onChange={e => setAnnImageInput(e.target.value)} placeholder="Image URL for announcement" />
            <button className="mt-2 px-3 py-1 bg-[#bfae9e] text-white rounded" onClick={handleSaveAnnImage} disabled={loading}>Save Image</button>
          </div>
        </div>
      )}
    </div>
  );
}
