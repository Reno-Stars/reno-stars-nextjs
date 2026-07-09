import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService } from '@/lib/data/services';
import { getLocalizedArea } from '@/lib/data/areas';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb, getProjectsByAreaFromDb, getFaqsByAreaFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import ServiceLocationPage from '@/components/pages/ServiceLocationPage';
import { BreadcrumbSchema, LocalBusinessAreaSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string; city: string }>;
}

// FULLY DYNAMIC — see /services/{svc}/page.tsx for full root-cause
// notes. Same Next 16 prerender-shell regression; same workaround.
import { serviceCityOverrides } from '@/lib/data/seo-overrides';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug, city } = await params;
  const [services, areas] = await Promise.all([getServicesFromDb(), getServiceAreasFromDb()]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area || service.showOnServicesPage === false) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const baseUrl = getBaseUrl();

  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.serviceLocation' }),
    getCompanyFromDb(),
  ]);
  const tagline = localizedService.tags?.slice(0, 2).join(' & ') ?? '';
  const years = company.yearsExperience;
  const tParams = { service: localizedService.title, area: localizedArea.name, years, tagline };
  // Use tagline variant only if it fits within ~60 chars (Google truncation limit)
  const titleWithTagline = tagline ? t('titleWithTagline', tParams) : '';
  let title = titleWithTagline && titleWithTagline.length <= 60
    ? titleWithTagline
    : t('title', tParams);
  let description = t('description', tParams);

  // High-priority keyword overrides driven by the local rank tracker (2026-04-08).
  // For specific city+service combos that are underperforming OR that hold the
  // most search volume, hand-tune the title/meta to put the exact keyword in
  // the title and boost CTR. EN only — Chinese keywords are different.
  const overrideKey = `${serviceSlug}/${city}`;
  const { en: enOverrides, zh: zhOverrides } = serviceCityOverrides(years);
  if (locale === 'en' && enOverrides[overrideKey]) {
    title = enOverrides[overrideKey].title;
    description = enOverrides[overrideKey].description;
  }
  // ZH overrides — parallel of the EN cabinet city CTR fix (commit 55f6962).
  // Mandarin Vancouver homeowners search 厨柜翻新 / 厨柜喷漆 / 厨柜重新喷漆
  // for cabinet refinishing work — terms not surfaced by the generic combo
  // template. Mirrors the EN "Cabinet Resurfacing & Refinishing {City}" pattern.
  if (locale === 'zh' && zhOverrides[overrideKey]) {
    title = zhOverrides[overrideKey].title;
    description = zhOverrides[overrideKey].description;
  }
  const ogImage = service.image || siteImages.hero;

  // Minor locales render the SAME templated body as EN (only EN/ZH have
  // native copy — the sitemap already restricts this route to en+zh, see
  // SERVICE_CITY_LOCALES in app/sitemap.ts). Noindex the other 12 locales
  // and restrict hreflang to en/zh so Google stops re-crawling ~1,800
  // duplicate service×city URLs ("Crawled - currently not indexed",
  // GSC 2026-07-07). Lift per-locale once native translations exist.
  const isIndexableLocale = locale === 'en' || locale === 'zh';

  return {
    title,
    description,
    ...(isIndexableLocale ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates(`/services/${serviceSlug}/${city}/`, locale, ['en', 'zh']),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/${city}/`,
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
  const { locale, 'service-slug': serviceSlug, city } = await params;
  setRequestLocale(locale);

  const [company, services, areas, googleReviews] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
    getGoogleReviews(),
  ]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area || service.showOnServicesPage === false) {
    notFound();
  }

  const [areaProjects, areaFaqs, t, faqT] = await Promise.all([
    getProjectsByAreaFromDb(area.name.en),
    getFaqsByAreaFromDb(area.id),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'faq' }),
  ]);

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const loc = locale as Locale;

  // Area-specific FAQs from database (localized)
  const dbFaqs = areaFaqs.map((faq) => ({
    id: faq.id,
    question: pickLocale(faq.question, loc),
    answer: pickLocale(faq.answer, loc),
  }));

  // Service-type FAQs from i18n (with {area} placeholder replaced by actual city name).
  // Wrap in safeFaq so a missing key degrades to empty rather than throwing
  // MISSING_MESSAGE — see /services/{svc}/page.tsx for why.
  const faqParams = { area: localizedArea.name };
  const safeFaq = (key: string): string => {
    try { return faqT(key, faqParams); }
    catch { return ''; }
  };
  const serviceFaqs = [
    { id: `${serviceSlug}-1`, question: safeFaq(`${serviceSlug}.q1`), answer: safeFaq(`${serviceSlug}.a1`) },
    { id: `${serviceSlug}-2`, question: safeFaq(`${serviceSlug}.q2`), answer: safeFaq(`${serviceSlug}.a2`) },
    { id: `${serviceSlug}-3`, question: safeFaq(`${serviceSlug}.q3`), answer: safeFaq(`${serviceSlug}.a3`) },
  ].filter((f) => f.question && f.answer);

  // Combine: area-specific first, then service-level
  const faqs = [...dbFaqs, ...serviceFaqs];

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
    { name: localizedService.title, url: `/${locale}/services/${serviceSlug}/` },
    { name: localizedArea.name, url: `/${locale}/services/${serviceSlug}/${city}/` },
  ];

  const tAreas = await getTranslations({ locale, namespace: 'areas' });
  const serviceTitle = tAreas('serviceInArea', { service: localizedService.title, area: localizedArea.name });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      {/* 2026-06-26: LocalBusiness schema — on-page scan P7 finding: all service+city
          sub-pages were missing LocalBusiness schema (only Service + BreadcrumbList
          were present). Adding LocalBusinessAreaSchema gives Google the geo/contact
          signals needed for local pack eligibility on "kitchen renovation richmond"
          style queries that land on service+city sub-pages. */}
      <LocalBusinessAreaSchema
        company={company}
        areaName={localizedArea.name}
        areaSlug={city}
        locale={locale}
        services={[localizedService.title]}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <ServiceSchema
        company={company}
        serviceName={serviceTitle}
        serviceDescription={localizedService.long_description || localizedService.description}
        location={localizedArea.name}
        url={`/${locale}/services/${serviceSlug}/${city}/`}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceLocationPage
        locale={locale as Locale}
        serviceSlug={serviceSlug as ServiceType}
        citySlug={city}
        company={company}
        service={service}
        area={area}
        services={services}
        areas={areas}
        faqs={faqs}
        areaProjects={areaProjects}
      />
    </>
  );
}
