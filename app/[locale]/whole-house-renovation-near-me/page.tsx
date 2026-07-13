import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb, getProjectsListFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import { selectNearbyProjects } from '@/lib/near-me-projects';

interface PageProps { params: Promise<{ locale: string }>; }

// Single source for this page's price band (finding #9/#24). Used by the meta
// description, the ServiceSchema serviceDescription, and the ServiceSchema
// priceRange prop so the three can never drift. The trailing "+" is a display
// convention (open-ended top), not a number. Do NOT re-type the band inline.
const PRICE_RANGE = { min: 50000, max: 200000 } as const;
const PRICE_BAND = `$${PRICE_RANGE.min / 1000}K-$${PRICE_RANGE.max / 1000}K+`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近全屋翻新 | 大温哥华 | Reno Stars' : 'Whole House Renovation Near Me | Vancouver Metro | Reno Stars';
  // 2026-05-21 SEO trim: EN desc was 187 chars (truncates ~155).
  // Drops "lighting" + "one team, one timeline" framing to fit.
  const description = isZh
    ? `大温哥华附近全屋翻新：厨房+卫浴+地板+油漆+照明一站式装修。${PRICE_BAND}，含许可与保险。免费估价。`
    : `Whole house renovation near you in Metro Vancouver — kitchen + bath + flooring + paint, one team. ${PRICE_BAND}. Permits + $5M insured.`;
  const baseUrl = getBaseUrl();
  return {
    title, description,
    // SEO de-dup consolidation (near-me cluster): consolidate this near-me
    // duplicate onto the stronger /services/whole-house/ page via rel=canonical
    // while still serving "whole house renovation near me" searchers. hreflang
    // is intentionally omitted on a canonicalized-away page. Umbrella
    // /renovation-near-me/ stays self-canonical. See kitchen page for rationale.
    alternates: { canonical: `${baseUrl}/${locale}/services/whole-house/` },
    openGraph: { title, description, url: `${baseUrl}/${locale}/whole-house-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website' },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [nav, t, areas, company, googleReviews, allProjects] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'nearMe' }),
    getServiceAreasFromDb(),
    getCompanyFromDb(),
    getGoogleReviews(),
    getProjectsListFromDb(),
  ]);
  const nearby = selectNearbyProjects(allProjects, 'whole-house', locale as Locale);
  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: locale === 'zh' ? '附近全屋翻新' : 'Whole House Renovation Near Me', url: `/${locale}/whole-house-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  const isZh = locale === 'zh';
  const serviceName = isZh ? '全屋翻新' : 'Whole House Renovation';
  const serviceDescription = isZh
    ? `大温哥华附近全屋翻新：厨房、卫浴、地板、油漆、电气照明一站式协调。${PRICE_BAND}。`
    : `Whole house renovation across Metro Vancouver — kitchen, bath, flooring, paint, lighting coordinated end-to-end. ${PRICE_BAND} typical. Permits handled.`;
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
        priceRange={PRICE_RANGE}
        serviceRadiusKm={50}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage
        locale={locale as Locale}
        areas={areas}
        h1Override={isZh ? '附近全屋翻新 — Metro Vancouver' : 'Whole-House Renovation Near Me in Metro Vancouver'}
        googleRating={googleReviews.rating}
        reviewCount={googleReviews.userRatingCount}
        variant="wholeHouse"
        nearbyProjects={nearby.projects}
        nearbyExact={nearby.exact}
      />
    </>
  );
}
