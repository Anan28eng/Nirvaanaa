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
  // and only if Cloudinary cloud name is configured via NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const useCloudinary = useMemo(() => {
    if (!normalizedSrc) return false;
    if (normalizedSrc.startsWith('http') || normalizedSrc.startsWith('data:')) return false;
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return false;
    return true;
  }, [normalizedSrc]);

  // Determine whether to let Next.js optimize images or serve them directly.
  // If caller explicitly passes `unoptimized` use that. Otherwise, for local
  // public images (starting with '/images/') prefer to serve them directly
  // to avoid hitting the Next.js Image Optimization API on hosts that don't
  // support it (which returns 400). Also respect build-time env var.
  const disableImageOptimizer = process.env.NEXT_DISABLE_IMAGE_OPTIMIZATION === 'true';
  const shouldUnoptimized = props.unoptimized !== undefined
    ? props.unoptimized
    : (disableImageOptimizer || (normalizedSrc && normalizedSrc.startsWith('/images/')));

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
        unoptimized={shouldUnoptimized}
        priority={priority}
        {...props}
      />
    </div>
  );
}
