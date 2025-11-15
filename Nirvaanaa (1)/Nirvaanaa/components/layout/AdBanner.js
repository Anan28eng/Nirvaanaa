"use client"
import { useEffect, useState } from 'react';

export default function AdBanner(props) {
  // props may be provided by parent (text, backgroundColor, textColor)
  const { text: propText, backgroundColor: propBg, textColor: propTextColor } = props || {};
  const [text, setText] = useState(propText || '');
  const [bg, setBg] = useState(propBg || '#fef3c7');
  const [color, setColor] = useState(propTextColor || '#111827');

  useEffect(() => {
    let mounted = true;

    console.debug('[AdBanner] mount, props:', { propText, propBg, propTextColor });

    const fetchBanner = async () => {
      try {
        const res = await fetch('/api/announcements/adbanner');
        if (!res.ok) return;
        const data = await res.json();
        const banner = data?.banner;
        if (!banner) {
          if (mounted && !propText) setText('');
          return;
        }
        if (mounted && !propText) setText(banner.text || banner.message || '');
        if (mounted && !propBg) setBg(banner.backgroundColor || propBg || '#fef3c7');
        if (mounted && !propTextColor) setColor(banner.textColor || propTextColor || '#111827');
      } catch (err) {
        console.log(err)
      }
    };
    // register listeners first to avoid missing early events
    const onRefresh = () => fetchBanner();
    if (typeof window !== 'undefined') {
      window.addEventListener('banners-refresh-request', onRefresh);
      window.addEventListener('banners-refreshed', onRefresh);
    }

    // initial fetch
    fetchBanner();

    // periodic refresh in case no real-time channel
    const interval = setInterval(fetchBanner, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('banners-refresh-request', onRefresh);
        window.removeEventListener('banners-refreshed', onRefresh);
      }
      console.debug('[AdBanner] unmount');
    };
  }, [propText, propBg, propTextColor]);

  const visibleText = propText ?? text;
  if (!visibleText) return null;

  return (
    
    <div className="w-full top-0 overflow-hidden relative z-[100]" style={{ backgroundColor: bg, color }}>
      <div className="whitespace-nowrap animate-scroll px-4 py-2 font-bold text-sm" style={{ color }}>
        {visibleText}
      </div>
    </div>
  );
}

