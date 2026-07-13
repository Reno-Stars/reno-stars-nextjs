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
    ? `大温哥华附近全屋家居装修：厨房、卫浴、地下室、整屋翻新。${PRICE_BAND}，跨17个城市。`
    : `Home renovation across Metro Vancouver — kitchen, bathroom, basement, whole-house. ${PRICE_BAND} range across 17 service areas.`;

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
      />
    </>
  );
}
