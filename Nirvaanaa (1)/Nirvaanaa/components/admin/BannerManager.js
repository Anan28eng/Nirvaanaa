"use client";
import React, { useEffect, useState } from 'react';
import AdBanner from '../layout/AdBanner';
import AnnouncementBanner from '../layout/AnnouncementBanner';
import Navbar from '../layout/Navbar';

export default function BannerManager() {
  const [adBanner, setAdBanner] = useState(null);
  const [announcementBanner, setAnnouncementBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    console.debug('[BannerManager] mounted');
    async function fetchBanners() {
      try {
        const [adRes, annRes] = await Promise.all([
          fetch('/api/announcements/adbanner'),
          fetch('/api/announcements/announcement'),
        ]);
        if (!mounted) return;
        const adData = adRes.ok ? await adRes.json() : null;
        const annData = annRes.ok ? await annRes.json() : null;
        if (adData?.banner) setAdBanner(adData.banner);
        if (annData?.banner) setAnnouncementBanner(annData.banner);
        // Notify listeners that banners were refreshed and are now rendered
        console.debug('[BannerManager] fetched banners', { ad: adData?.banner, announcement: annData?.banner });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('banners-refreshed', { detail: { ad: adData?.banner, announcement: annData?.banner } }));
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      }
    }
    // Register listeners first so we don't miss events dispatched early
    const onBannersUpdated = () => { fetchBanners(); };
    const onRefreshRequest = () => { fetchBanners(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('banners-updated', onBannersUpdated);
      window.addEventListener('banners-refresh-request', onRefreshRequest);
    }

    // initial fetch and periodic refresh
    fetchBanners();
    const interval = setInterval(fetchBanners, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('banners-updated', onBannersUpdated);
        window.removeEventListener('banners-refresh-request', onRefreshRequest);
      }
      console.debug('[BannerManager] unmounted');
    };
  }, []);

  return (
    <>
      {adBanner?.isAdBannerActive && (
        <AdBanner  backgroundColor={adBanner.backgroundColor} textColor={adBanner.textColor} />
      )}

      

      {announcementBanner?.isAnnouncementActive && (
        <AnnouncementBanner banner={announcementBanner} />
      )}
    </>
  );
}
