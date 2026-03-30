'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Lazy-loading video component that:
 * 1. Always renders the <video> element to avoid CLS
 * 2. Uses CSS to hide video on mobile (no JS layout shift)
 * 3. Only loads video source when it enters viewport on desktop
 * 4. Respects prefers-reduced-motion
 */
export default function LazyVideo({ src, poster, className = '' }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  // Intersection Observer to detect when video is in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if we're on mobile via matchMedia (don't load video on mobile)
    const mq = window.matchMedia('(max-width: 767px)');
    if (mq.matches) return;

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

    // Re-check on breakpoint change (e.g. device rotation from mobile → desktop).
    // When isVisible flips to true this effect re-runs, creating a new observer
    // that early-returns above if already on mobile — so no duplicate observation.
    const handleChange = (e: MediaQueryListEvent) => {
      if (!e.matches && !isVisible) {
        observer.observe(video);
      }
    };
    mq.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', handleChange);
    };
  }, [isVisible]);

  // Load and play video when visible
  useEffect(() => {
    if (!isVisible) return;

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
  }, [isVisible, src]);

  // Always render <video> — hidden on mobile via CSS, no JS-driven layout shift
  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden="true"
      className={`${className} hidden md:block ${shouldPlay ? '' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.5s ease-in-out' }}
    />
  );
}
