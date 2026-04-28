'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const AW_CONVERSION_ID = process.env.NEXT_PUBLIC_AW_CONVERSION_ID;

/**
 * Google Analytics 4 + Google Ads conversion tracking component.
 * Add to layout to enable pageview tracking and Ads remarketing.
 *
 * Required env vars:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g., G-XXXXXXXXXX)
 *   NEXT_PUBLIC_AW_CONVERSION_ID (e.g., AW-364086044) — optional, for Google Ads
 */
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* lazyOnload: skips Next's automatic <link rel="preload"> emission for
          third-party analytics scripts. Tag fires after window load — pageviews
          still tracked, but no LCP-bandwidth competition with critical resources. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
          ${AW_CONVERSION_ID ? `gtag('config', '${AW_CONVERSION_ID}');` : ''}
        `}
      </Script>
    </>
  );
}
