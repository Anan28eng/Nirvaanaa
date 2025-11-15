"use client";
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBanner({ banner }) {
  const [announcement, setAnnouncement] = useState(banner || null);
  const [isVisible, setIsVisible] = useState(Boolean(banner));

  useEffect(() => {
    if (banner) {
      setAnnouncement(banner);
      setIsVisible(true);
      return;
    }

    let mounted = true;

    console.debug('[AnnouncementBanner] mount');

    const fetchAnnouncement = async () => {
      try {
        const response = await fetch('/api/announcements/announcement');
        if (response.ok) {
          const data = await response.json();
          if (data.banner && mounted) {
            setAnnouncement(data.banner);
            setIsVisible(true);
          } else if (mounted) {
            setAnnouncement(null);
            setIsVisible(false);
          }
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    // register listeners before initial fetch to avoid missing an early update
    const onRefresh = () => fetchAnnouncement();
    if (typeof window !== 'undefined') {
      window.addEventListener('banners-refresh-request', onRefresh);
      window.addEventListener('banners-refreshed', onRefresh);
    }

    fetchAnnouncement();

    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('banners-refresh-request', onRefresh);
        window.removeEventListener('banners-refreshed', onRefresh);
      }
      console.debug('[AnnouncementBanner] unmount');
    };
  }, [banner]);

  const handleClose = () => setIsVisible(false);

  if (!announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full block relative overflow-hidden"
        style={{ backgroundColor: announcement.backgroundColor || '#f59e0b', color: announcement.textColor || '#ffffff' }}
      >
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3 text-center gap-4">
              <div className="flex-1 flex items-center justify-center gap-4">
                {announcement.image ? (
                  <img src={announcement.image} alt="announcement" className="h-full w-full object-cover rounded" />
                ) : null}

                <div className="text-sm">
                  {announcement.text && !announcement.link?.url && (
                    <span>{announcement.text}</span>
                  )}
                  {announcement.link?.url && (
                    <a
                      href={announcement.link.url}
                      className="hover:underline transition-colors"
                      target={announcement.link.url.startsWith('http') ? '_blank' : '_self'}
                      rel={announcement.link.url && announcement.link.url.startsWith('http') ? 'noopener noreferrer' : ''}
                    >
                      {announcement.link.text || announcement.text || announcement.link.url}
                    </a>
                  )}
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


