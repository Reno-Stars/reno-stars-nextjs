import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps { params: Promise<{ locale: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近卫浴装修 | 大温哥华 | Reno Stars' : 'Bathroom Renovation Near Me | Vancouver Metro | Reno Stars';
  // 2026-05-21 SEO trim: EN desc was 201 chars (truncates ~155). Drops the
  // 3-city list (on-page elsewhere) and the warranty tail to fit.
  const description = isZh
    ? '大温哥华附近专业卫浴装修：淋浴房改造、浴缸更换、瓷砖墙面、洗手柜。$15K-$45K，3-6周完工。70+五星好评，免费估价。'
    : 'Bathroom renovation near you across Metro Vancouver — walk-in showers, tub conversions, custom vanities. $15K-$45K, 3-6 wks. $5M insured.';
  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(title, description);
  return {
    title, description,
    alternates: buildAlternates('/bathroom-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/bathroom-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
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
    { name: locale === 'zh' ? '附近卫浴装修' : 'Bathroom Renovation Near Me', url: `/${locale}/bathroom-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  const isZh = locale === 'zh';
  const serviceName = isZh ? '卫浴装修' : 'Bathroom Renovation';
  const serviceDescription = isZh
    ? '大温哥华附近专业卫浴装修：淋浴房改造、浴缸更换、定制洗手柜。$15K-$45K，3-6周完工。'
    : 'Bathroom renovation across Metro Vancouver — walk-in showers, tub-to-shower conversions, custom vanities, full retile. $15K-$45K, 3-6 wks.';
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/bathroom-renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={{ min: 15000, max: 45000 }}
        serviceRadiusKm={50}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage
        locale={locale as Locale}
        areas={areas}
        h1Override={isZh ? '附近浴室翻新 — Metro Vancouver' : 'Bathroom Renovation Near Me in Metro Vancouver'}
      />
    </>
  );
}
