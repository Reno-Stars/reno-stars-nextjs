'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Meta (Facebook) Pixel — conversion tracking + remarketing for FB/IG ads.
 * Get your Pixel ID from: https://business.facebook.com → Events Manager → Pixels
 * Add NEXT_PUBLIC_META_PIXEL_ID to Vercel env vars.
 */
function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!META_PIXEL_ID || typeof window === 'undefined') return;
    const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPixelPageView />
      </Suspense>
    </>
  );
}

/**
 * Track a Meta Pixel event (call from client components).
 * Usage: trackMetaEvent('Lead', { value: 100, currency: 'CAD' })
 */
export function trackMetaEvent(
  event: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') {
    fbq('track', event, params);
  }
}
