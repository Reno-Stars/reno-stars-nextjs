'use client';

import { useEffect } from 'react';
import { initDeferredAnalytics } from '@/lib/analytics-loader';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const AW_CONVERSION_ID = process.env.NEXT_PUBLIC_AW_CONVERSION_ID;

/**
 * Google Analytics 4 + Google Ads conversion tracking.
 *
 * Thin env wrapper — the deferred-loading implementation and the full
 * rationale (defer-to-interaction TBT win, visibilitychange fallback, why not
 * requestIdleCallback) live in lib/analytics-loader.ts.
 *
 * Required env: NEXT_PUBLIC_GA_MEASUREMENT_ID (G-XXXX).
 * Optional:     NEXT_PUBLIC_AW_CONVERSION_ID (AW-XXXX, Google Ads).
 */
export default function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    return initDeferredAnalytics(GA_MEASUREMENT_ID, AW_CONVERSION_ID);
  }, []);

  return null;
}
