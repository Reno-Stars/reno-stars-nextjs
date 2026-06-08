import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale, isRtl } from '@/i18n/config';
import { LocalBusinessSchema, WebSiteSchema } from '@/components/structured-data';
import { Analytics } from '@vercel/analytics/next';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MicrosoftClarity from '@/components/MicrosoftClarity';
import MetaPixel from '@/components/MetaPixel';
import GoogleAdsConversion from '@/components/GoogleAdsConversion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// Nav-scoped reads (tag `nav:globals`, ≤24h TTL): the footer/nav shows globals on
// EVERY page, so reading the per-content tags (company/services/service-areas/
// social-links) here meant any global edit regenerated all ~13k pages. These
// variants decouple the shell so a global edit only refreshes the page that
// FEATURES it (services page, contact, areas index), not the whole site. ISR Phase 2.
import { getCompanyForNav, getSocialLinksForNav, getServicesForNav, getServiceAreasForNav } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import { images } from '@/lib/data';
import { ASSET_ORIGIN } from '@/lib/storage';
import { NAVY } from '@/lib/theme';
import { buildPreloadUrl, buildProcessedUrl, buildProcessedSrcSet, isR2Url } from '@/lib/image';


// SSR for the entire site (2026-06-08). `force-dynamic` cascades to every route
// under /[locale], so pages render on-demand and NOTHING is written to the ISR
// Full-Route Cache (the ISR-Write-Units bill). Rationale: this is a low-traffic
// site, so per-request SSR (~12ms renders, with all DB reads still served from
// the cheap Data Cache) is cheaper than ISR — which was paying a write unit on
// every crawl-driven cache-miss/eviction for pages that were never hit enough to
// benefit from caching. SEO is unchanged: crawlers get identical fully-rendered
// HTML. Bonus: content edits surface instantly (no cache to revalidate). High
// traffic pages can be reverted to ISR later if the site grows.
export const dynamic = 'force-dynamic';

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

  const [messages, t, company, socialLinks, services, areas, googleReviews] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'metadata' }),
    getCompanyForNav(),
    getSocialLinksForNav(),
    getServicesForNav(),
    getServiceAreasForNav(),
    getGoogleReviews(),
  ]);
  const localBusinessDescription = t('localBusinessDescription');

  // suppressHydrationWarning: locale from URL params may differ during initial hydration;
  // also handles browser extensions (Grammarly, etc.) modifying the DOM
  return (
    <html lang={locale} dir={isRtl(locale as Locale) ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* Preconnect for faster asset loading (implies dns-prefetch) */}
        <link rel="preconnect" href={ASSET_ORIGIN} crossOrigin="anonymous" />
        {/* Google user-content CDN serves the reviewer avatar PNGs that the
            TestimonialsSection marquee (homepage) + ReviewsPage render from
            `review.authorPhotoUri`. Preconnecting saves ~150–300ms on the
            first avatar fetch since the TLS+DNS+TCP for googleusercontent.com
            happens in parallel with HTML parsing instead of after the
            <img> tags resolve. crossOrigin=anonymous because Google's CDN
            requires it and the avatar URLs do not carry credentials. */}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        {/* Preload hero image for faster LCP. When the hero lives on R2 with
            pre-processed variants, use a responsive imagesrcset preload so
            mobile fetches the 21KB 640w WebP instead of the 173KB legacy JPG
            (was the LCP bottleneck — 5.6s mobile per the seo-builder Apr 7
            audit). type="image/webp" lets the <3% of browsers without WebP
            skip the preload entirely. */}
        {isR2Url(images.hero) ? (
          <link
            rel="preload"
            as="image"
            href={buildProcessedUrl(images.hero, 828)}
            imageSrcSet={buildProcessedSrcSet(images.hero)}
            imageSizes="100vw"
            type="image/webp"
            fetchPriority="high"
          />
        ) : (
          <link rel="preload" as="image" href={buildPreloadUrl(images.hero, 828)} type="image/webp" fetchPriority="high" />
        )}
        {/* RSS feed discovery — localized title per locale for accurate browser bookmark labels */}
        <link rel="alternate" type="application/rss+xml" title={
          locale === 'zh' ? 'Reno Stars 博客 RSS'
          : locale === 'zh-Hant' ? 'Reno Stars 部落格 RSS'
          : locale === 'ja' ? 'Reno Stars ブログ RSS'
          : locale === 'ko' ? 'Reno Stars 블로그 RSS'
          : locale === 'es' ? 'Reno Stars Blog RSS'
          : 'Reno Stars Blog RSS'
        } href={`/${locale}/feed.xml`} />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <MetaPixel />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <GoogleAdsConversion />
        <NextIntlClientProvider messages={messages}>

          <WebSiteSchema locale={locale} />
          <LocalBusinessSchema
            company={company}
            socialLinks={socialLinks}
            areas={areas}
            googleRating={googleReviews.rating}
            googleReviewCount={googleReviews.userRatingCount}
            reviews={googleReviews.reviews.slice(0, 5)}
            description={localBusinessDescription}
            locale={locale as Locale}
          />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
            style={{ backgroundColor: NAVY, color: '#fff' }}
          >
            {locale === 'zh' ? '跳到主要内容' : locale === 'zh-Hant' ? '跳到主要內容' : 'Skip to main content'}
          </a>
          <Navbar company={company} services={services.filter(s => s.isProjectType !== false)} />
          <main id="main-content">
            {children}
          </main>
          <Footer company={company} socialLinks={socialLinks} services={services.filter(s => s.showOnServicesPage !== false)} areas={areas} googleRating={googleReviews.rating} />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
