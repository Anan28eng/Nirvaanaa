"use client";
import React from 'react'
import { useState, useEffect } from "react";
import AdBanner from "./AdBanner";
import AnnouncementBanner from "./AnnouncementBanner";
import Navbar from './Navbar';
import Footer from './Footer';

export default function BannerLayout({ children }) {
  const [adBanner, setAdBanner] = useState(null);
  const [announcementBanner, setAnnouncementBanner] = useState(null);

  useEffect(() => {
    // Fetch banners from API and expose refresh hooks for admin
    let mounted = true;
    const fetchBanners = async () => {
      try {
        const [adRes, annRes] = await Promise.all([
          fetch('/api/announcements/adbanner'),
          fetch('/api/announcements/announcement'),
        ]);
        if (!mounted) return;
        let adData = null;
        let annData = null;
        if (adRes.ok) {
          adData = await adRes.json();
          setAdBanner(adData.banner || null);
        } else {
          setAdBanner(null);
        }
        if (annRes.ok) {
          annData = await annRes.json();
          setAnnouncementBanner(annData.banner || null);
        } else {
          setAnnouncementBanner(null);
        }

        // notify potential listeners (admin) that banners were refreshed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('banners-refreshed', { detail: { ad: adData?.banner || null, announcement: annData?.banner || null } }));
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };
    fetchBanners();

    const onRequest = () => fetchBanners();
    window.addEventListener('banners-refresh-request', onRequest);

    // periodic background refresh
    const interval = setInterval(fetchBanners, 10000);

    return () => { mounted = false; clearInterval(interval); window.removeEventListener('banners-refresh-request', onRequest); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* AdBanner above Navbar if toggled on */}
      {adBanner && adBanner.isAdBannerActive && (
        <AdBanner text={adBanner.text} backgroundColor={adBanner.backgroundColor} textColor={adBanner.textColor} />
      )}
      <Navbar />
      {/* AnnouncementBanner below Navbar if toggled on */}
      {announcementBanner && announcementBanner.isAnnouncementActive && (
        <AnnouncementBanner banner={announcementBanner} />
      )}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}


 