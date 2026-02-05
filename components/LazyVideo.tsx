'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Lazy-loading video component that:
 * 1. Shows poster image immediately for fast LCP
 * 2. Only loads video when it enters viewport
 * 3. Hides video on mobile to save bandwidth (uses poster image instead)
 * 4. Respects prefers-reduced-motion
 */
export default function LazyVideo({ src, poster, className = '' }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile (SSR-safe)
  const [shouldPlay, setShouldPlay] = useState(false);

  // Detect mobile on client
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer to detect when video is in viewport
  useEffect(() => {
    if (isMobile) return; // Don't observe on mobile

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isMobile]);

  // Load and play video when visible
  useEffect(() => {
    if (!isVisible || isMobile) return;

    const video = videoRef.current;
    if (!video) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Set source and play
    video.src = src;
    video.load();

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setShouldPlay(true))
        .catch(() => {
          // Autoplay was prevented, that's fine
        });
    }
  }, [isVisible, isMobile, src]);

  // On mobile, just show the poster image
  if (isMobile) {
    return (
      <div
        className={className}
        style={{ backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden="true"
      className={`${className} ${shouldPlay ? '' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.5s ease-in-out' }}
    />
  );
}
