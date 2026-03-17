'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

interface MarqueeProps {
  /** Semantic items — rendered once, always in SSR output for crawlers */
  children: ReactNode;
  /** Decorative clones for seamless loop — only rendered client-side */
  clones: ReactNode;
  /** Tailwind classes for the scrolling track (flex, gap, etc.) */
  trackClassName: string;
  /** Total animation duration in seconds */
  duration: number;
  /** Accessible label for the carousel region */
  label: string;
}

export default function Marquee({ children, clones, trackClassName, duration, label }: MarqueeProps) {
  const [ready, setReady] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReady(!mql.matches); };
    update();
    mql.addEventListener('change', update);
    return () => { mql.removeEventListener('change', update); };
  }, []);

  const pause = useCallback(() => { trackRef.current?.style.setProperty('animation-play-state', 'paused'); }, []);
  const resume = useCallback(() => { trackRef.current?.style.setProperty('animation-play-state', 'running'); }, []);

  return (
    <div
      className="overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div
        ref={trackRef}
        className={trackClassName}
        style={ready ? { animation: `marquee-scroll ${duration}s linear infinite` } : undefined}
      >
        {children}
        {ready && (
          <div className="contents" aria-hidden="true" inert>
            {clones}
          </div>
        )}
      </div>
    </div>
  );
}
