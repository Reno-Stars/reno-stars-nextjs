import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

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
