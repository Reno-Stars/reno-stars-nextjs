'use client';

/**
 * OptimizedImage — drop-in replacement for next/image that uses our
 * self-hosted /api/image sharp endpoint for resizing + WebP conversion.
 *
 * Generates responsive srcSet at standard breakpoints so the browser
 * downloads the smallest image that fits the viewport.
 */

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
  quality = 75,
  style,
  'aria-hidden': ariaHidden,
  onError: onErrorProp,
}: OptimizedImageProps) {
  const resolvedLoading = priority ? 'eager' : (loading || 'lazy');
  const resolvedDecoding = priority ? 'sync' : 'async';
  const fillClassName = fill ? 'absolute inset-0 w-full h-full' : '';
  const fillStyle = fill ? { objectFit: 'cover' as const, ...style } : style;

  // For relative paths (e.g. /worksafe-bc-logo.jpg), use regular img
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  if (!isExternal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
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
      />
    );
  }

  // Fall back to original src if the optimized version fails to load.
  // If the fallback also fails, invoke the caller's onError (e.g. DesignPage broken-image tracking).
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={buildOptimizedUrl(src, 828, quality)}
      srcSet={buildSrcSet(src, quality)}
      sizes={sizes}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={resolvedLoading}
      decoding={resolvedDecoding}
      fetchPriority={priority ? 'high' : undefined}
      className={`${fillClassName} ${className}`}
      style={fillStyle}
      aria-hidden={ariaHidden}
      onError={handleError}
    />
  );
}
