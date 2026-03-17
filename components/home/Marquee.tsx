'use client';

import { useEffect } from 'react';

interface MarqueeProps {
  /** ID of the track element containing semantic items */
  trackId: string;
  /** How many clone sets for seamless looping (via DOM cloneNode) */
  repeatCount: number;
  /** Total animation duration in seconds */
  duration: number;
}

/**
 * Renderless client component that activates a marquee animation on an
 * existing server-rendered track element. Clones the track's children via
 * DOM cloneNode so no React elements cross the client boundary — the RSC
 * payload contains only primitive props (string + numbers).
 */
export default function Marquee({ trackId, repeatCount, duration }: MarqueeProps) {
  useEffect(() => {
    const track = document.getElementById(trackId);
    if (!track) return;
    const container = track.parentElement;
    if (!container) return;

    // Respect reduced-motion preference
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    // Clone semantic children into an aria-hidden container
    const clonesWrapper = document.createElement('div');
    clonesWrapper.className = 'contents';
    clonesWrapper.setAttribute('aria-hidden', 'true');
    clonesWrapper.inert = true;

    const nodes = Array.from(track.children);
    const totalCloneSets = repeatCount * 2 - 1;
    for (let s = 0; s < totalCloneSets; s++) {
      for (const node of nodes) {
        clonesWrapper.appendChild(node.cloneNode(true));
      }
    }
    track.appendChild(clonesWrapper);

    // Start animation
    track.style.animation = `marquee-scroll ${duration}s linear infinite`;

    // Hover/focus pause
    const pause = () => { track.style.animationPlayState = 'paused'; };
    const resume = () => { track.style.animationPlayState = 'running'; };
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('focusin', pause);
    container.addEventListener('focusout', resume);

    // Live reduced-motion listener
    const handleMotionChange = () => {
      if (mql.matches) {
        track.style.animation = '';
        clonesWrapper.remove();
      } else {
        track.appendChild(clonesWrapper);
        track.style.animation = `marquee-scroll ${duration}s linear infinite`;
      }
    };
    mql.addEventListener('change', handleMotionChange);

    return () => {
      track.style.animation = '';
      clonesWrapper.remove();
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
      container.removeEventListener('focusin', pause);
      container.removeEventListener('focusout', resume);
      mql.removeEventListener('change', handleMotionChange);
    };
  }, [trackId, repeatCount, duration]);

  return null;
}
