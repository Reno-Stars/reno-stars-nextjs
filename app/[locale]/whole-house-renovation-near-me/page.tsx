import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps { params: Promise<{ locale: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近全屋翻新 | 大温哥华 | Reno Stars' : 'Whole House Renovation Near Me | Vancouver Metro | Reno Stars';
  // 2026-05-21 SEO trim: EN desc was 187 chars (truncates ~155).
  // Drops "lighting" + "one team, one timeline" framing to fit.
  const description = isZh
    ? '大温哥华附近全屋翻新：厨房+卫浴+地板+油漆+照明一站式装修。$150K-$800K+，含许可与保险。免费估价。'
    : 'Whole house renovation near you in Metro Vancouver — kitchen + bath + flooring + paint, one team. $150K-$800K+. Permits + $5M insured.';
  const baseUrl = getBaseUrl();
  return {
    title, description,
    alternates: buildAlternates('/whole-house-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/whole-house-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website' },
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
    { name: locale === 'zh' ? '附近全屋翻新' : 'Whole House Renovation Near Me', url: `/${locale}/whole-house-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  const isZh = locale === 'zh';
  const serviceName = isZh ? '全屋翻新' : 'Whole House Renovation';
  const serviceDescription = isZh
    ? '大温哥华附近全屋翻新：厨房、卫浴、地板、油漆、电气照明一站式协调。$150K-$800K+。'
    : 'Whole house renovation across Metro Vancouver — kitchen, bath, flooring, paint, lighting coordinated end-to-end. $150K-$800K+ typical. Permits handled.';
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/whole-house-renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={{ min: 150000, max: 800000 }}
        serviceRadiusKm={50}
        locale={locale}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage
        locale={locale as Locale}
        areas={areas}
        h1Override={isZh ? '附近全屋翻新 — Metro Vancouver' : 'Whole-House Renovation Near Me in Metro Vancouver'}
      />
    </>
  );
}
