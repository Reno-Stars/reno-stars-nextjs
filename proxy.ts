import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing, locales, defaultLocale, type Locale } from './i18n/config';
import { verifyToken } from './lib/admin/auth';
import { ASSET_ORIGIN, PROD_ORIGIN } from './lib/storage';

const intlMiddleware = createMiddleware(routing);

const isDev = process.env.NODE_ENV === 'development';

// S3 endpoint origin for presigned URL uploads (e.g., R2, MinIO)
const S3_ORIGIN = (() => {
  const ep = process.env.S3_ENDPOINT;
  if (!ep) return '';
  try { return new URL(ep).origin; } catch { return ''; }
})();

// Security headers with environment-aware CSP
const securityHeaders: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'on',
  // HSTS — 2 years, all subdomains (admin., api., invoice.), eligible for browser preload list
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // X-XSS-Protection set to 0: the header is deprecated in modern browsers
  // and can introduce vulnerabilities in older ones. CSP is the replacement.
  'X-XSS-Protection': '0',
  // X-Frame-Options kept for legacy browser fallback; CSP frame-ancestors is authoritative
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  // TODO: when we have a CSP reporting endpoint provisioned (e.g. report-uri.com,
  // Sentry CSP, or a self-hosted /api/csp-report route), add Content-Security-Policy-Report-Only
  // here with a stricter nonce-based policy. Then once telemetry shows zero violations,
  // drop 'unsafe-inline' from the enforced policy below.
  'Content-Security-Policy': [
    "default-src 'self'",
    // 'unsafe-inline' required for:
    // - Next.js inline scripts (hydration, route announcer)
    // - JSON-LD structured data in <script type="application/ld+json">
    // - Inline styles from component libraries
    // Migration path: Use next.config.ts experimental.cspNonce when stable,
    // which adds nonces to inline scripts. See: https://nextjs.org/docs/app/api-reference/next-config-js/cspNonce
    // Analytics/ads script hosts: GTM bootstraps Clarity + Google Ads
    // conversion tags, and the Cloudflare tunnel auto-injects its RUM beacon —
    // all were being CSP-blocked (observed 2026-07-08 console).
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://googleads.g.doubleclick.net https://www.googleadservices.com"
      : "script-src 'self' 'unsafe-inline' blob: https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://static.cloudflareinsights.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https: ${ASSET_ORIGIN}`,
    "font-src 'self' data:",
    isDev
      ? `connect-src 'self' blob: ws: wss: ${ASSET_ORIGIN}${S3_ORIGIN ? ` ${S3_ORIGIN}` : ''} https://cdn.jsdelivr.net https://*.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://www.google.com https://*.doubleclick.net https://cloudflareinsights.com`
      : `connect-src 'self' blob: ${ASSET_ORIGIN}${S3_ORIGIN ? ` ${S3_ORIGIN}` : ''} https://cdn.jsdelivr.net https://*.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://www.google.com https://*.doubleclick.net https://cloudflareinsights.com`,
    `media-src 'self' ${ASSET_ORIGIN}${ASSET_ORIGIN !== PROD_ORIGIN ? ` ${PROD_ORIGIN}` : ''}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'self' https://www.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Canonical host: 301 apex → www. Vercel's domain config used to do this;
  // now that the site is served behind Cloudflare Tunnel (self-hosted), enforce
  // it here so the apex doesn't become duplicate content. www is canonical
  // (NEXT_PUBLIC_BASE_URL = https://www.reno-stars.com).
  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (host === 'reno-stars.com' || host.startsWith('reno-stars.com:')) {
    return addSecurityHeaders(
      NextResponse.redirect(
        `https://www.reno-stars.com${pathname}${request.nextUrl.search}`,
        301,
      ),
    );
  }

  // Admin routes — handle auth check (skip login page)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname === '/admin/login/') {
      return addSecurityHeaders(NextResponse.next());
    }

    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie || !verifyToken(sessionCookie)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect double-locale paths: /en/en/..., /zh/en/..., etc.
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2
    && locales.includes(segments[0] as Locale)
    && locales.includes(segments[1] as Locale)) {
    const corrected = '/' + segments[0] + '/' + segments.slice(2).join('/');
    const target = new URL(corrected + (pathname.endsWith('/') && !corrected.endsWith('/') ? '/' : ''), request.url);
    return addSecurityHeaders(NextResponse.redirect(target, 301));
  }

  // Redirect old /process route to /workflow
  if (/\/process(\/|$)/.test(pathname)) {
    const newPath = pathname.replaceAll('/process', '/workflow');
    const target = new URL(newPath, request.url);
    return addSecurityHeaders(NextResponse.redirect(target, 301));
  }

  // /signup is the GeoClockr Universal Link landing — see
  // app/signup/page.tsx. The companion mobile app + Apple App Site
  // Association declare `/signup?invite=*` as the deep-link target.
  // The redirect chain `/signup → /en/signup` would (a) lose the
  // `?invite=` param on some Vercel edge cases and (b) require
  // duplicating the page under `[locale]/` for no SEO upside (the
  // page is `noindex`). Skip locale routing for this path entirely.
  if (pathname === '/signup' || pathname === '/signup/') {
    return addSecurityHeaders(NextResponse.next());
  }

  // /geoclockr/privacy is the GeoClockr privacy policy — see
  // app/geoclockr/privacy/page.tsx. This exact URL is submitted to Google
  // Play (App content → Privacy policy) and App Store Connect, and both
  // re-check reachability during review. Locale-prefixing it would break
  // the submitted URL, so skip locale routing for this path entirely.
  // Unlike /signup this page IS indexable; it self-canonicalises to the
  // locale-free URL.
  if (pathname === '/geoclockr/privacy' || pathname === '/geoclockr/privacy/') {
    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect non-locale paths to /en/ with 308 (permanent) so Google consolidates
  // link equity on the canonical /en/... URL instead of the bare path.
  // next-intl would handle these with a 307 (temporary), which doesn't pass equity.
  // Matcher config already excludes /api, /_next, /_vercel, and paths with extensions.
  if (segments.length > 0 && !locales.includes(segments[0] as Locale)) {
    // Add trailing slash in the SAME redirect to avoid a 2-hop chain
    // (non-locale → /en/ is one hop; without this, trailingSlash config
    // would add a second hop from /en/path → /en/path/).
    const withSlash = pathname.endsWith('/') ? pathname : pathname + '/';
    const target = new URL(`/en${withSlash}`, request.url);
    target.search = request.nextUrl.search;
    return addSecurityHeaders(NextResponse.redirect(target, 308));
  }

  // Root "/" — 308 permanent redirect to /en/ so Google consolidates link equity.
  // next-intl would use 307 (temporary), which doesn't pass equity.
  if (pathname === '/') {
    const target = new URL('/en/', request.url);
    target.search = request.nextUrl.search;
    return addSecurityHeaders(NextResponse.redirect(target, 308));
  }

  // All other routes — next-intl locale middleware + security headers
  const response = addSecurityHeaders(intlMiddleware(request));

  // Set x-locale header for the root layout to read
  // Extract locale from pathname (first segment after /)
  const pathLocale = pathname.split('/')[1];
  const locale = locales.includes(pathLocale as Locale) ? pathLocale : defaultLocale;
  response.headers.set('x-locale', locale);

  // (CDN edge-cache header is set at the platform layer in next.config.ts
  // `headers()` — middleware runs too late to influence the edge cache decision.)

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files with extensions
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
