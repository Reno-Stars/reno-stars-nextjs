'use client';

import { useEffect } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const AW_CONVERSION_ID = process.env.NEXT_PUBLIC_AW_CONVERSION_ID;

/**
 * Google Analytics 4 + Google Ads conversion tracking.
 *
 * gtag.js (~350 KB, ~590ms of main-thread work) is the single largest TBT
 * contributor on the site. To keep it off the critical path entirely, we defer
 * loading until the FIRST user interaction (scroll / tap / key / pointer). An
 * engaged visitor triggers it within milliseconds, so conversions and real
 * pageviews are still tracked; a purely-bounced session (no interaction) is the
 * only thing that goes uncounted — an accepted tradeoff for the performance win
 * (owner decision, 2026-07-16).
 *
 * A post-load idle fallback (requestIdleCallback, 10s timeout) still fires for
 * no-interaction visitors who linger, so most bounce pageviews are recovered —
 * and because it runs during idle / after TTI, it doesn't count against TBT.
 *
 * Required env: NEXT_PUBLIC_GA_MEASUREMENT_ID (G-XXXX).
 * Optional:     NEXT_PUBLIC_AW_CONVERSION_ID (AW-XXXX, Google Ads).
 */
export default function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    let started = false;
    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart', 'mousemove'] as const;
    const listenerOpts: AddEventListenerOptions = { once: true, passive: true, capture: true };
    let idleHandle: number | undefined;

    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, start, listenerOpts));
      if (idleHandle !== undefined) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
    };

    function start() {
      if (started) return;
      started = true;
      cleanup();

      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      // gtag pushes the raw `arguments` — mirror the canonical snippet.
      const gtag = (...args: unknown[]) => { window.dataLayer!.push(args); };
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID!, { page_path: window.location.pathname });
      if (AW_CONVERSION_ID) gtag('config', AW_CONVERSION_ID);
    }

    events.forEach((e) => window.addEventListener(e, start, listenerOpts));

    // Fallback for visitors who never interact — runs when the main thread is
    // idle (post-TTI), so it recovers the pageview without hurting TBT.
    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(start, { timeout: 10000 });
    } else {
      idleHandle = window.setTimeout(start, 10000);
    }

    return cleanup;
  }, []);

  return null;
}
