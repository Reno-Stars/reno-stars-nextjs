import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Single source for this page's price band (finding #9/#24). Used by the
// ServiceSchema serviceDescription and the ServiceSchema priceRange prop so the
// two can never drift. The trailing "+" is a display convention (open-ended
// top), not a number. Do NOT re-type the band inline.
const PRICE_RANGE = { min: 10000, max: 200000 } as const;
const PRICE_BAND = `$${PRICE_RANGE.min / 1000}K-$${PRICE_RANGE.max / 1000}K+`;

// Unlike the room-specific near-me pages, this umbrella page IS self-canonical
// (it keeps its hreflang cluster). Single source for the path so the declared
// canonical and the share URL derived from it cannot drift apart.
const CANONICAL_PATH = '/renovation-near-me/';

// Module-level so generateMetadata's OG title/image and the share-card
// title/image are the same strings, not two copies that can drift. Async
// because this page's title/description come from the message catalogue rather
// than inline literals.
async function getPageMeta(locale: string): Promise<{ title: string; description: string; ogImage: string }> {
  const t = await getTranslations({ locale, namespace: 'metadata.nearMe' });
  const title = t('title');
  const description = t('description');
  return { title, description, ogImage: buildOgImageUrl(title, description) };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { title, description, ogImage } = await getPageMeta(locale);

  const baseUrl = getBaseUrl();

  return {
    title,
    description,
    alternates: buildAlternates(CANONICAL_PATH, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/renovation-near-me/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t, areas, company, googleReviews, meta] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'nearMe' }),
    getServiceAreasFromDb(),
    getCompanyFromDb(),
    getGoogleReviews(),
    getPageMeta(locale),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: t('breadcrumb'), url: `/${locale}/renovation-near-me/` },
  ];

  const faqs = Array.from({ length: 6 }).map((_, i) => ({
    question: t(`faq.q${i + 1}`),
    answer: t(`faq.a${i + 1}`),
  }));

  const isZh = locale === 'zh';
  const serviceName = isZh ? '家居装修' : 'Home Renovation';
  const serviceDescription = isZh
    ? `大温哥华附近全屋家居装修：厨房、卫浴、地下室、整屋翻新。${PRICE_BAND}，跨17个城市。`
    : `Home renovation across Metro Vancouver — kitchen, bathroom, basement, whole-house. ${PRICE_BAND} range across 17 service areas.`;

  // Share URL is DERIVED from the canonical this page declares (the same
  // CANONICAL_PATH generateMetadata passes to buildAlternates) rather than
  // rebuilt, so the two cannot drift apart. This page is self-canonical, so the
  // share URL is its own.
  const shareUrl = buildAlternates(CANONICAL_PATH, locale).canonical;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={PRICE_RANGE}
        serviceRadiusKm={50}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage
        locale={locale as Locale}
        areas={areas}
        googleRating={googleReviews.rating}
        reviewCount={googleReviews.userRatingCount}
        share={{ url: shareUrl, title: meta.title, imageUrl: meta.ogImage }}
        shareItemId="renovation-near-me"
      />
    </>
  );
}
