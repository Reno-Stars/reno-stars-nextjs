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
  // X-XSS-Protection set to 0: the header is deprecated in modern browsers
  // and can introduce vulnerabilities in older ones. CSP is the replacement.
  'X-XSS-Protection': '0',
  // X-Frame-Options kept for legacy browser fallback; CSP frame-ancestors is authoritative
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    // 'unsafe-inline' required for:
    // - Next.js inline scripts (hydration, route announcer)
    // - JSON-LD structured data in <script type="application/ld+json">
    // - Inline styles from component libraries
    // Migration path: Use next.config.ts experimental.cspNonce when stable,
    // which adds nonces to inline scripts. See: https://nextjs.org/docs/app/api-reference/next-config-js/cspNonce
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
      : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https: ${ASSET_ORIGIN}`,
    "font-src 'self' data:",
    isDev
      ? `connect-src 'self' ws: wss: ${ASSET_ORIGIN}${S3_ORIGIN ? ` ${S3_ORIGIN}` : ''} https://www.google-analytics.com https://www.googletagmanager.com`
      : `connect-src 'self' ${ASSET_ORIGIN}${S3_ORIGIN ? ` ${S3_ORIGIN}` : ''} https://www.google-analytics.com https://www.googletagmanager.com`,
    `media-src 'self' ${ASSET_ORIGIN}${ASSET_ORIGIN !== PROD_ORIGIN ? ` ${PROD_ORIGIN}` : ''}`,
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

  // All other routes — next-intl locale middleware + security headers
  const response = addSecurityHeaders(intlMiddleware(request));

  // Set x-locale header for the root layout to read
  // Extract locale from pathname (first segment after /)
  const pathLocale = pathname.split('/')[1];
  const locale = locales.includes(pathLocale as Locale) ? pathLocale : defaultLocale;
  response.headers.set('x-locale', locale);

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
