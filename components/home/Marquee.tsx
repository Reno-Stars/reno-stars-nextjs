'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

interface MarqueeProps {
  /** Semantic items — rendered once, always in SSR output for crawlers */
  children: ReactNode;
  /** How many times to clone the children for seamless looping (via DOM cloneNode) */
  repeatCount: number;
  /** Tailwind classes for the scrolling track (flex, gap, etc.) */
  trackClassName: string;
  /** Total animation duration in seconds */
  duration: number;
  /** Accessible label for the carousel region */
  label: string;
}

export default function Marquee({ children, repeatCount, trackClassName, duration, label }: MarqueeProps) {
  const [ready, setReady] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const semanticRef = useRef<HTMLDivElement>(null);
  const clonesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReady(!mql.matches); };
    update();
    mql.addEventListener('change', update);
    return () => { mql.removeEventListener('change', update); };
  }, []);

  // Clone semantic children into the clones container via DOM cloneNode.
  // This avoids serializing clone data in the RSC hydration payload.
  useEffect(() => {
    const semantic = semanticRef.current;
    const container = clonesRef.current;
    if (!ready || !semantic || !container) return;

    // Total clone sets needed: repeatCount * 2 - 1
    // (repeatCount sets fill the first half, repeatCount - 1 sets fill the loop duplicate)
    const totalCloneSets = repeatCount * 2 - 1;
    const nodes = Array.from(semantic.children);
    for (let s = 0; s < totalCloneSets; s++) {
      for (const node of nodes) {
        container.appendChild(node.cloneNode(true));
      }
    }

    return () => { container.replaceChildren(); };
  }, [ready, repeatCount]);

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
        <div ref={semanticRef} className="contents">
          {children}
        </div>
        {ready && (
          <div ref={clonesRef} className="contents" aria-hidden="true" inert />
        )}
      </div>
    </div>
  );
}
