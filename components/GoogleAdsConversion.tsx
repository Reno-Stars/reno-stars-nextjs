'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const AW_CONVERSION_ID = process.env.NEXT_PUBLIC_AW_CONVERSION_ID;
const AW_CONVERSION_LABEL = process.env.NEXT_PUBLIC_AW_CONVERSION_LABEL;

/**
 * Google Ads conversion tracking component.
 * Fires a conversion event when the user lands on the thank-you page.
 *
 * Required env vars:
 *   NEXT_PUBLIC_AW_CONVERSION_ID (e.g., AW-364086044)
 *   NEXT_PUBLIC_AW_CONVERSION_LABEL (e.g., Ndg-COCy8ckZEJyGzq0B)
 */
export default function GoogleAdsConversion() {
  const pathname = usePathname();

  useEffect(() => {
    if (!AW_CONVERSION_ID || !AW_CONVERSION_LABEL) return;
    if (!pathname?.includes('/contact/thank-you')) return;
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'conversion', {
      send_to: `${AW_CONVERSION_ID}/${AW_CONVERSION_LABEL}`,
      value: 100.0,
      currency: 'CAD',
    });
  }, [pathname]);

  return null;
}
