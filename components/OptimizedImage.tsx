'use client';

/**
 * OptimizedImage — drop-in with LQIP (Low Quality Image Placeholder):
 * 1. Instantly shows a tiny 20px thumbnail (blurred) — loads in ~100ms even cold
 * 2. Loads the full-res image in the background
 * 3. Crossfades from thumbnail → full image when ready
 */

import { useState, useEffect, useRef } from 'react';
import { buildOptimizedUrl, buildSrcSet, buildProcessedSrcSet, buildProcessedUrl, isR2Url } from '@/lib/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  className?: string;
  fill?: boolean;
  quality?: number;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean | 'true' | 'false';
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  priority = false,
  loading,
  className = '',
  fill = false,
  quality = 70,
  style,
  'aria-hidden': ariaHidden,
  onError: onErrorProp,
  placeholder = 'blur',
}: OptimizedImageProps) {
  const [fullLoaded, setFullLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resolvedLoading = priority ? 'eager' : (loading || 'lazy');
  const resolvedDecoding = priority ? 'sync' : 'async';

  const fillClassName = fill ? 'absolute inset-0 w-full h-full' : '';
  const hasObjectFit = className.includes('object-');
  const defaultObjectFit = fill && !hasObjectFit ? 'object-cover' : '';
  const combinedClassName = `${fillClassName} ${defaultObjectFit} ${className}`.trim();

  // Intersection observer — watch wrapper div for LQIP, img for simple path
  useEffect(() => {
    if (priority) return;
    const el = wrapperRef.current || imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); } },
      { rootMargin: '50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  // Non-external images (local paths like /logo.png) — simple img, no LQIP
  const isExternal = src.startsWith('http://') || src.startsWith('https://');
  if (!isExternal || placeholder === 'empty') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef as React.RefObject<HTMLImageElement>}
        src={isExternal ? (isInView ? buildOptimizedUrl(src, 828, quality) : undefined) : src}
        srcSet={isExternal && isInView ? buildSrcSet(src, quality) : undefined}
        sizes={isExternal ? sizes : undefined}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={resolvedLoading}
        decoding={resolvedDecoding}
        fetchPriority={priority ? 'high' : undefined}
        className={combinedClassName}
        style={style}
        aria-hidden={ariaHidden}
        onError={onErrorProp}
      />
    );
  }

  // LQIP: tiny 20px thumbnail URL
  // For R2 images: use pre-processed WebP variants (zero Fluid CPU cost)
  // For other images: fall back to /api/image route
  const useProcessed = isR2Url(src);
  const thumbSrc = buildOptimizedUrl(src, 20, 30); // always via /api/image — tiny, fast
  const fullSrc = isInView
    ? (useProcessed ? buildProcessedUrl(src, 828) : buildOptimizedUrl(src, 828, quality))
    : undefined;
  const fullSrcSet = isInView
    ? (useProcessed ? buildProcessedSrcSet(src) : buildSrcSet(src, quality))
    : undefined;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.srcset = '';
      img.src = src;
    } else {
      onErrorProp?.();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={fill ? 'absolute inset-0' : 'relative'}
      style={fill ? undefined : { width, height }}
      aria-hidden={ariaHidden}
    >
      {/* Shimmer skeleton — visible while full image is loading */}
      {!fullLoaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            overflow: 'hidden',
            borderRadius: 'inherit',
            background: 'linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
            opacity: fullLoaded ? 0 : 1,
            transition: 'opacity 0.3s ease-out',
          }}
        />
      )}

      {/* Shimmer keyframes — injected once */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Thumbnail (LQIP) — blurred preview, fades out when full image ready */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbSrc}
        alt=""
        aria-hidden="true"
        className={combinedClassName}
        style={{
          ...style,
          position: fill ? undefined : 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: 'blur(20px)',
          transform: 'scale(1.05)',
          opacity: fullLoaded ? 0 : 1,
          transition: 'opacity 0.4s ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Full image — fades in on top when loaded */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fullSrc}
        srcSet={fullSrcSet}
        sizes={sizes}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={resolvedLoading}
        decoding={resolvedDecoding}
        fetchPriority={priority ? 'high' : undefined}
        className={combinedClassName}
        style={{
          ...style,
          opacity: fullLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
        onError={handleError}
        onLoad={() => setFullLoaded(true)}
      />
    </div>
  );
}
