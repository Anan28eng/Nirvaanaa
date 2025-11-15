"use client "
import React from 'react';
import { useBanner } from '../context/BannerContext';

const BannerTogglePanel = () => {
  const { adBanner, setAdBanner, announcementBanner, setAnnouncementBanner } = useBanner();

  return (
    <div className="banner-toggle-panel">
      <h3>Ad Banner Control</h3>
      <input
        type="text"
        placeholder="Enter marquee text"
        value={adBanner.text}
        onChange={(e) => setAdBanner({ ...adBanner, text: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={adBanner.visible}
          onChange={(e) => setAdBanner({ ...adBanner, visible: e.target.checked })}
        />
        Show Ad Banner
      </label>

      <h3>Announcement Banner Control</h3>
      <input
        type="text"
        placeholder="Enter image URL"
        value={announcementBanner.image}
        onChange={(e) => setAnnouncementBanner({ ...announcementBanner, image: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={announcementBanner.visible}
          onChange={(e) => setAnnouncementBanner({ ...announcementBanner, visible: e.target.checked })}
        />
        Show Announcement Banner
      </label>
    </div>
  );
};

export default BannerTogglePanel;