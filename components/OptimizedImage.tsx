'use client';

/**
 * OptimizedImage — drop-in replacement for next/image with performance optimizations:
 * - Self-hosted /api/image for resizing + WebP conversion
 * - Responsive srcSet at standard breakpoints
 * - Blur placeholder for smooth loading
 * - Lazy loading with intersection observer
 */

import { useState, useEffect, useRef } from 'react';
import { buildOptimizedUrl, buildSrcSet } from '@/lib/image';

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
  /** Show blur placeholder while loading (default: true) */
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Priority images load immediately
  const imgRef = useRef<HTMLImageElement>(null);

  const resolvedLoading = priority ? 'eager' : (loading || 'lazy');
  const resolvedDecoding = priority ? 'sync' : 'async';
  const fillClassName = fill ? 'absolute inset-0 w-full h-full' : '';
  const fillStyle = fill ? { objectFit: 'cover' as const, ...style } : style;

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Start loading 50px before visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // For relative paths (e.g. /worksafe-bc-logo.jpg), use regular img
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  if (!isExternal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={resolvedLoading}
        decoding={resolvedDecoding}
        className={`${fillClassName} ${className}`}
        style={fillStyle}
        aria-hidden={ariaHidden}
        onError={onErrorProp}
        onLoad={() => setIsLoaded(true)}
      />
    );
  }

  // Blur placeholder style
  const placeholderStyle = placeholder === 'blur' && !isLoaded
    ? {
        filter: 'blur(10px)',
        transform: 'scale(1.1)',
        transition: 'filter 0.3s ease-out, transform 0.3s ease-out',
      }
    : {
        filter: 'blur(0)',
        transform: 'scale(1)',
        transition: 'filter 0.3s ease-out, transform 0.3s ease-out',
      };

  // Fall back to original src if the optimized version fails to load.
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

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Don't render src/srcset until in view (for non-priority images)
  const imgSrc = isInView ? buildOptimizedUrl(src, 828, quality) : undefined;
  const imgSrcSet = isInView ? buildSrcSet(src, quality) : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={imgSrc}
      srcSet={imgSrcSet}
      sizes={sizes}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={resolvedLoading}
      decoding={resolvedDecoding}
      fetchPriority={priority ? 'high' : undefined}
      className={`${fillClassName} ${className}`}
      style={{ ...fillStyle, ...placeholderStyle }}
      aria-hidden={ariaHidden}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
