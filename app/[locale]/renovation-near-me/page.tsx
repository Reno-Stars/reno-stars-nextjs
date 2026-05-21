import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Target queries: "renovation near me", "home renovation near me",
// "bathroom/kitchen renovation near me", "renovation companies near me".
// Competitor pattern (Angi/HomeGuide): generic "near me" landing that
// lists local pros + FAQ + service area matcher. We don't aggregate pros;
// we ARE the pros — so this page anchors the query to our brand + links
// out to all 14 area sub-pages for geo-specific follow-up.


export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.nearMe' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/renovation-near-me/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/renovation-near-me/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{ url: ogImage, alt: t('title') }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t, areas, company, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'nearMe' }),
    getServiceAreasFromDb(),
    getCompanyFromDb(),
    getGoogleReviews(),
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
    ? '大温哥华附近全屋家居装修：厨房、卫浴、地下室、整屋翻新。$15K-$800K+，跨17个城市。'
    : 'Home renovation across Metro Vancouver — kitchen, bathroom, basement, whole-house. $15K-$800K+ range across 17 service areas.';

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={{ min: 15000, max: 800000 }}
        serviceRadiusKm={50}
        locale={locale}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage locale={locale as Locale} areas={areas} />
    </>
  );
}
