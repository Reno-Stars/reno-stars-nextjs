import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { LocalBusinessSchema, WebSiteSchema } from '@/components/structured-data';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MicrosoftClarity from '@/components/MicrosoftClarity';
import GoogleAdsConversion from '@/components/GoogleAdsConversion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCompanyFromDb, getSocialLinksFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import { images } from '@/lib/data';
import { ASSET_ORIGIN } from '@/lib/storage';
import { NAVY } from '@/lib/theme';
import { buildPreloadUrl } from '@/lib/image';

// Revalidate layout data every hour (ISR)
export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, company, socialLinks, services, areas, googleReviews] = await Promise.all([
    getMessages(),
    getCompanyFromDb(),
    getSocialLinksFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
    getGoogleReviews(),
  ]);

  // suppressHydrationWarning: locale from URL params may differ during initial hydration;
  // also handles browser extensions (Grammarly, etc.) modifying the DOM
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect for faster asset loading (implies dns-prefetch) */}
        <link rel="preconnect" href={ASSET_ORIGIN} crossOrigin="anonymous" />
        {/* Preload hero image for faster LCP — optimized WebP at mobile width.
            type="image/webp" lets the <3% of browsers without WebP skip the preload;
            they still get the image via the <img> onError fallback in OptimizedImage. */}
        <link rel="preload" as="image" href={buildPreloadUrl(images.hero, 828)} type="image/webp" fetchPriority="high" />
        {/* RSS feed discovery */}
        <link rel="alternate" type="application/rss+xml" title={locale === 'zh' ? 'Reno Stars 博客 RSS' : 'Reno Stars Blog RSS'} href={`/${locale}/feed.xml/`} />
        <GoogleAnalytics />
        <MicrosoftClarity />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <GoogleAdsConversion />
        <NextIntlClientProvider messages={messages}>

          <WebSiteSchema />
          <LocalBusinessSchema
            company={company}
            socialLinks={socialLinks}
            areas={areas}
            googleRating={googleReviews.rating}
            googleReviewCount={googleReviews.userRatingCount}
          />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
            style={{ backgroundColor: NAVY, color: '#fff' }}
          >
            {locale === 'zh' ? '跳到主要内容' : 'Skip to main content'}
          </a>
          <Navbar company={company} services={services.filter(s => s.isProjectType !== false)} />
          <main id="main-content">
            {children}
          </main>
          <Footer company={company} socialLinks={socialLinks} services={services.filter(s => s.showOnServicesPage !== false)} areas={areas} googleRating={googleReviews.rating} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
