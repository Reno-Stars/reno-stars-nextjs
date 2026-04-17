import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';

/**
 * Root (`/`) page — SEO-compliant landing that redirects to `/en/`.
 *
 * Previously a bare 308 redirect (configured in next.config.ts). Google
 * indexed the redirect URL with no title / description and showed it in
 * SERPs: 1,519 impressions at position 2.0 on 2026-04-13, only 1 click
 * (0.07% CTR). Users saw a blank snippet and scrolled past.
 *
 * Now we serve real HTML at `/` with the English homepage title +
 * description, a canonical pointing at `/en/` so signals consolidate, and
 * a `<meta http-equiv="refresh">` so browsers still land on `/en/`. Bots
 * see rich metadata for the SERP; humans get auto-redirected.
 */
export const metadata: Metadata = {
  title: 'Vancouver Home Renovations — 20+ Yrs, $5M Insured | Reno Stars',
  description:
    'Kitchen, bathroom & whole-house renovations across Metro Vancouver. 20+ years in business, $5M CGL insurance, WCB-covered crews & 3-year warranty. See 100+ completed projects or get your free quote today.',
  alternates: {
    canonical: `${getBaseUrl()}/en/`,
    languages: {
      'en': `${getBaseUrl()}/en/`,
      'zh': `${getBaseUrl()}/zh/`,
      'x-default': `${getBaseUrl()}/en/`,
    },
  },
  // Don't pollute social cards for the redirect URL — use /en/'s instead
  openGraph: {
    title: 'Vancouver Home Renovations — 20+ Yrs, $5M Insured | Reno Stars',
    description:
      'Kitchen, bathroom & whole-house renovations across Metro Vancouver. 20+ years, $5M CGL insurance, 3-year warranty.',
    url: `${getBaseUrl()}/en/`,
    type: 'website',
  },
};

export default function RootRedirect() {
  const target = `${getBaseUrl()}/en/`;
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
      </head>
      <body>
        <p>
          Redirecting to <a href={target}>Reno Stars — Vancouver Home Renovations</a>…
        </p>
        <script
          // Client-side fallback for the rare case `<meta refresh>` is disabled
          dangerouslySetInnerHTML={{
            __html: `window.location.replace(${JSON.stringify(target)});`,
          }}
        />
      </body>
    </html>
  );
}
