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
  const [thumbLoaded, setThumbLoaded] = useState(false); // shimmer hides when thumb loads
  const [fullLoaded, setFullLoaded] = useState(false);   // blur fades when full loads
  const [isInView, setIsInView] = useState(priority);
  const shimmerTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fullImgRef = useRef<HTMLImageElement>(null);
  const thumbImgRef = useRef<HTMLImageElement>(null);
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

  // Clear the fallback marker when src changes — otherwise the sticky
  // dataset.fallback from a previous image short-circuits handleError for the
  // new src and the new image gets hidden instead of trying its own fallback.
  // Don't reset load state here: the cached-images effect below will correct
  // it on the next render and avoiding the toggle prevents an opacity flicker.
  useEffect(() => {
    if (fullImgRef.current) delete fullImgRef.current.dataset.fallback;
  }, [src]);

  // Handle images already in browser cache — onLoad won't fire for them.
  // Must live before any early return so the hook runs on every code path
  // (rules-of-hooks). On the simple-img branch the refs are null, so the
  // checks no-op safely.
  useEffect(() => {
    if (thumbImgRef.current?.complete && thumbImgRef.current.naturalWidth > 0) setThumbLoaded(true);
    if (fullImgRef.current?.complete && fullImgRef.current.naturalWidth > 0) setFullLoaded(true);
  }, [src, isInView]);

  // Safety net: if thumb never loads after 3s, hide shimmer anyway. Also
  // hoisted above the early return for rules-of-hooks compliance.
  useEffect(() => {
    if (!isInView || thumbLoaded) return;
    shimmerTimeoutRef.current = setTimeout(() => setThumbLoaded(true), 3000);
    return () => clearTimeout(shimmerTimeoutRef.current);
  }, [isInView, thumbLoaded]);

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

  // LQIP: tiny thumbnail URL
  // For R2 admin/designs images: use pre-processed 320w variant as thumb (instant, no /api/image)
  // For other images: fall back to /api/image route
  const useProcessed = isR2Url(src);
  const thumbSrc = useProcessed
    ? buildProcessedUrl(src, 320)   // direct R2, no redirect, ~fast
    : buildOptimizedUrl(src, 20, 30); // /api/image for external/legacy
  const fullSrc = isInView
    ? (useProcessed ? buildProcessedUrl(src, 828) : buildOptimizedUrl(src, 828, quality))
    : undefined;
  const fullSrcSet = isInView
    ? (useProcessed ? buildProcessedSrcSet(src) : buildSrcSet(src, quality))
    : undefined;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.fallback) {
      // First failure: try falling back to original source URL
      img.dataset.fallback = '1';
      img.srcset = '';
      img.src = src;
    } else {
      // Second failure: image completely broken — hide everything
      setThumbLoaded(true);
      setFullLoaded(true);
      onErrorProp?.();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={fill ? 'absolute inset-0' : 'relative'}
      style={fill ? { isolation: 'isolate' } : { width, height, isolation: 'isolate' }}
      aria-hidden={ariaHidden}
    >
      {/* Shimmer — only shown until thumb loads (~instant for R2, <300ms) */}
      {!thumbLoaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            overflow: 'hidden',
            borderRadius: 'inherit',
            background: 'linear-gradient(90deg, #d8d8d8 25%, #e8e8e8 50%, #d8d8d8 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
            transition: 'opacity 0.3s ease-out',
          }}
        />
      )}

      {/* Thumb — blurred preview, shows as soon as it loads, fades out when full image ready */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbSrc}
        alt=""
        aria-hidden="true"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority="low"
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
        ref={thumbImgRef}
        onLoad={() => setThumbLoaded(true)}
        onError={() => setThumbLoaded(true)}
      />

      {/* Full image — fades in on top when loaded. Only mount once in view so
          SSR HTML never emits an <img> without src/srcset (W3C validation). */}
      {isInView && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fullSrc}
          srcSet={fullSrcSet}
          sizes={fullSrcSet ? sizes : undefined}
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
          ref={fullImgRef}
          onError={handleError}
          onLoad={() => setFullLoaded(true)}
        />
      )}
    </div>
  );
}
