'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import cloudinaryLoader from '@/utils/cloudinary-loader';

const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const FALLBACK_SRC = '/images/fallback-product.svg';

export default function SafeImage({ src, alt = '', className = '', sizes = DEFAULT_SIZES, priority = false, quality = 75, style = {}, ...props }) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const normalizedSrc = src || '';

  // Decide whether to use cloudinary loader: use it only for relative src paths
  const useCloudinary = useMemo(() => {
    if (!normalizedSrc) return false;
    if (normalizedSrc.startsWith('http') || normalizedSrc.startsWith('data:')) return false;
    return true;
  }, [normalizedSrc]);

  const onLoad = () => setLoading(false);
  const onError = () => {
    setLoading(false);
    setErrored(true);
  };

  const finalSrc = errored ? FALLBACK_SRC : (normalizedSrc || FALLBACK_SRC);

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" aria-hidden="true" />
      )}

      <Image
        src={finalSrc}
        alt={alt}
        sizes={sizes}
        quality={quality}
        onLoadingComplete={onLoad}
        onError={onError}
        loader={useCloudinary ? cloudinaryLoader : undefined}
        {...props}
      />
    </div>
  );
}
