import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { LocalBusinessSchema } from '@/components/structured-data';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCompanyFromDb, getSocialLinksFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import { images } from '@/lib/data';
import { ASSET_ORIGIN } from '@/lib/storage';

// Revalidate layout data every hour (ISR)
export const revalidate = 3600;

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
        {/* Preload hero image for faster LCP */}
        <link rel="preload" as="image" href={images.hero} fetchPriority="high" />
        <GoogleAnalytics />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <LocalBusinessSchema
            company={company}
            socialLinks={socialLinks}
            areas={areas}
            googleRating={googleReviews.rating}
            googleReviewCount={googleReviews.userRatingCount}
          />
          <Navbar company={company} areas={areas} />
          <main id="main-content">
            {children}
          </main>
          <Footer company={company} socialLinks={socialLinks} services={services} areas={areas} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
