import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps { params: Promise<{ locale: string }>; }

// Single source for this page's price band (finding #9/#24). Used by the meta
// description, the ServiceSchema serviceDescription, and the ServiceSchema
// priceRange prop so the three can never drift. The trailing "+" is a display
// convention (open-ended top), not a number. Do NOT re-type the band inline.
const PRICE_RANGE = { min: 30000, max: 120000 } as const;
const PRICE_BAND = `$${PRICE_RANGE.min / 1000}K-$${PRICE_RANGE.max / 1000}K+`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近地下室装修 | 大温哥华 | Reno Stars' : 'Basement Renovation Near Me | Vancouver Metro | Reno Stars';
  // 2026-05-21 SEO trim: EN desc was 171 chars (truncates ~155).
  // Drops the "3-yr warranty" + "Free quote" tail to fit.
  const description = isZh
    ? `大温哥华附近专业地下室装修：suite改造、家庭影院、活动室。${PRICE_BAND}，8-16周。许可证代办，防水保障。免费估价。`
    : `Basement renovation near you in Metro Vancouver. Legal suites, family rooms, home theatres. ${PRICE_BAND}, 8-16 wks. Permits handled, $5M insured.`;
  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(title, description);
  return {
    title, description,
    alternates: buildAlternates('/basement-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/basement-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
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
    { name: locale === 'zh' ? '附近地下室装修' : 'Basement Renovation Near Me', url: `/${locale}/basement-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  const isZh = locale === 'zh';
  const serviceName = isZh ? '地下室装修' : 'Basement Renovation';
  const serviceDescription = isZh
    ? `大温哥华附近专业地下室装修：legal suite改造、家庭影院、活动室、防水。${PRICE_BAND}，8-16周。`
    : `Basement renovation across Metro Vancouver — legal suites, family rooms, home theatres, waterproofing. ${PRICE_BAND}, 8-16 wks. Permits handled.`;
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/basement-renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={PRICE_RANGE}
        serviceRadiusKm={50}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage
        locale={locale as Locale}
        areas={areas}
        h1Override={isZh ? '附近地下室翻新 — Metro Vancouver' : 'Basement Renovation Near Me in Metro Vancouver'}
      />
    </>
  );
}
