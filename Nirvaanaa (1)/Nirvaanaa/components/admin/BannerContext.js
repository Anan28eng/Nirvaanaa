"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const BannerContext = createContext();

export const useBanner = () => useContext(BannerContext);

export const BannerProvider = ({ children }) => {
  const [adBanner, setAdBanner] = useState(null);
  const [announcementBanner, setAnnouncementBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        if (!res.ok) throw new Error('Failed to load banners');
        const data = await res.json();
        if (!mounted) return;
        setAdBanner(data.banners?.ad || null);
        setAnnouncementBanner(data.banners?.announcement || null);
      } catch (err) {
        console.warn('BannerProvider fetch failed', err);
      }
    };
    fetchBanners();
    // subscribe to manual refresh requests from UI
    const onRefresh = () => fetchBanners();
    if (typeof window !== 'undefined') {
      window.addEventListener('banners-refresh-request', onRefresh);
    }
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') window.removeEventListener('banners-refresh-request', onRefresh);
    };
  }, []);

  // optimistic toggle with rollback
  const toggleBanner = async ({ id, type, visible, content, extra }) => {
    setLoading(true);
    // snapshot
    const prevAd = adBanner ? { ...adBanner } : null;
    const prevAnnouncement = announcementBanner ? { ...announcementBanner } : null;

    try {
      // optimistic update
      if (type === 'ad') {
        setAdBanner(prev => ({ ...(prev || {}), isAdBannerActive: visible, text: typeof content === 'string' ? content : (prev?.text || '') }));
      }
      if (type === 'announcement') {
        setAnnouncementBanner(prev => ({ ...(prev || {}), isAnnouncementActive: visible, image: typeof content === 'string' ? content : (prev?.image || '') }));
      }

      // send PATCH
      const res = await fetch(`/api/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: type === 'ad' ? 'ad' : 'announcement', visible, content, ...extra }),
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      const json = await res.json();
      // replace with authoritative banner from server
      if (json.banner) {
        if (type === 'ad') setAdBanner(json.banner);
        if (type === 'announcement') setAnnouncementBanner(json.banner);
      }

      toast.success('Banner updated');
      // notify other components
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('banners-refreshed'));
      return { ok: true, banner: json.banner };
    } catch (err) {
      console.warn('toggleBanner error', err);
      // rollback
      setAdBanner(prevAd);
      setAnnouncementBanner(prevAnnouncement);
      toast.error('Failed to persist banner change');
      return { ok: false, error: String(err) };
    } finally {
      setLoading(false);
    }
  };

  return (
    <BannerContext.Provider value={{ adBanner, announcementBanner, toggleBanner, loading, refresh: () => window.dispatchEvent(new Event('banners-refresh-request')) }}>
      {children}
    </BannerContext.Provider>
  );
};