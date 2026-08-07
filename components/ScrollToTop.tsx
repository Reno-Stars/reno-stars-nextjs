'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll to the top of the document on forward navigation.
 *
 * App Router already "scrolls on navigation", but it scrolls the changed ROUTE
 * SEGMENT into view rather than the document. With a long page that lands you
 * mid-page: from the homepage footer (scrollY 9594) the Blog & News link landed
 * at 3236 instead of 0, so the destination opened part-way down.
 *
 * Deliberately does NOT fire on:
 *  - the initial render (nothing to reset, and it would fight a deep link)
 *  - back/forward, so the browser's own scroll restoration still works
 *  - URLs with a hash, so in-page anchors (#faq) still land on their target
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const cameFromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      cameFromHistory.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (cameFromHistory.current) {
      cameFromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
