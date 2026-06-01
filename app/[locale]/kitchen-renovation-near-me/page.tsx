import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb, getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps { params: Promise<{ locale: string }>; }
export function generateStaticParams() { return PRERENDERED_LOCALES.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近厨房装修 | 大温哥华 | Reno Stars' : 'Kitchen Renovation Near Me | Vancouver Metro | Reno Stars';
  // 2026-05-21 SEO trim: EN desc was 206 chars (Google truncates ~155).
  // Keeps the keyword, geo, scope, price band, timeline + insurance — drops
  // the 3-city list (already on-page) and the redundant "Free quotes" tail.
  const description = isZh
    ? '大温哥华附近专业厨房装修：定制橱柜、石英石台面、瓷砖墙面、电器升级。$25K-$90K，4-8周完工。70+五星好评，免费估价。'
    : 'Kitchen renovation near you across Metro Vancouver — custom cabinets, quartz countertops, full design-build. $25K-$90K, 4-8 wks. $5M insured.';
  const baseUrl = getBaseUrl();
  return {
    title, description,
    alternates: buildAlternates('/kitchen-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/kitchen-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website' },
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
    { name: locale === 'zh' ? '附近厨房装修' : 'Kitchen Renovation Near Me', url: `/${locale}/kitchen-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  const isZh = locale === 'zh';
  const serviceName = isZh ? '厨房装修' : 'Kitchen Renovation';
  const serviceDescription = isZh
    ? '大温哥华附近专业厨房装修：定制橱柜、石英石台面、设计建造一站式。$25K-$90K，4-8周完工。'
    : 'Full design-build kitchen renovation across Metro Vancouver — custom cabinets, quartz countertops, appliance integration. $25K-$90K, 4-8 wks.';
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceSchema
        company={company}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        url={`/${locale}/kitchen-renovation-near-me/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={{ min: 25000, max: 90000 }}
        serviceRadiusKm={50}
        locale={locale}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <NearMePage locale={locale as Locale} areas={areas} />
    </>
  );
}
