import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService } from '@/lib/data/services';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import { BreadcrumbSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string }>;
}

/**
 * Price ranges in CAD per service slug — fed into ServiceSchema's
 * `hasOfferCatalog.priceSpecification` so Google can render a price snippet
 * on SERP listings. Numbers come from the in-page pricing tiers + cost guides
 * (kitchen 14-72, bathroom 15-45, etc.). Update when tier copy changes.
 */
const SERVICE_PRICE_RANGES: Record<string, { min: number; max: number } | undefined> = {
  kitchen: { min: 14000, max: 72000 },
  bathroom: { min: 15000, max: 45000 },
  basement: { min: 35000, max: 130000 },
  'whole-house': { min: 50000, max: 250000 },
  commercial: { min: 30000, max: 200000 },
  flooring: { min: 5000, max: 25000 },
  painting: { min: 3000, max: 15000 },
};


// FULLY DYNAMIC — every request runs the Lambda fresh, bypassing the
// Next 16 prerender-shell regression that was returning URL-encoded
// segment templates as params for non-prerendered locale URLs.
//
// Trade-off: every request is a Lambda invocation (no edge cache for
// the response HTML). Vercel function quota cost ~1 invocation per page
// view; on a renovation marketing site this is well within budget. EN
// pages STILL get the prerender boost via the parent [locale] layout's
// generateStaticParams (en/zh/zh-Hant), but the page-level HTML always
// runs through the Lambda.
//
// Why not `dynamicParams = true` + multi-locale generateStaticParams:
// confirmed via debug3 logs on 2026-05-04 deploy b6oujjk9v —
// non-prerendered locales hit a "shell" prerender at the route template
// path with URL-encoded segment templates as params, which fails in
// `services.find(s => s.slug === '[service-slug]')` and triggers
// notFound(). Single-locale generateStaticParams (matching working
// /projects/[slug] /blog/[slug] /areas/[city]) was insufficient to
// suppress the shell. force-dynamic is the only reliable workaround.
//
// `safeFaq()` below is a separate defensive fix for `faqT(`${slug}.q1`)`
// throwing MISSING_MESSAGE on new services before their FAQ keys land.

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug } = await params;
  const services = await getServicesFromDb();
  const service = services.find((s) => s.slug === serviceSlug);

  if (!service || service.showOnServicesPage === false) {
    return { title: 'Service Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const baseUrl = getBaseUrl();
  const description = truncateMetaDescription(localizedService.long_description || localizedService.description);

  const ogImage = service.image || siteImages.hero;

  const title = locale === 'zh'
    ? `${localizedService.title} 温哥华 — 免费报价, 3年保修 | Reno Stars`
    : `${localizedService.title} Vancouver — Free Quote, 3-Yr Warranty | Reno Stars`;

  return {
    title,
    description,
    alternates: buildAlternates(`/services/${serviceSlug}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: localizedService.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: localizedService.title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, 'service-slug': serviceSlug } = await params;
  setRequestLocale(locale);

  const [company, services, areas, googleReviews] = await Promise.all([getCompanyFromDb(), getServicesFromDb(), getServiceAreasFromDb(), getGoogleReviews()]);
  const service = services.find((s) => s.slug === serviceSlug);

  if (!service || service.showOnServicesPage === false) {
    notFound();
  }
  const localizedService = getLocalizedService(service, locale as Locale);

  const [t, faqT] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'faq' }),
  ]);

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
    { name: localizedService.title, url: `/${locale}/services/${serviceSlug}/` },
  ];

  // Build FAQs for this service type (general page defaults to Vancouver).
  // Wrap in safeFaq so a missing key (new service added to DB before its
  // i18n FAQ entries land) degrades to an empty string instead of throwing
  // MISSING_MESSAGE — Next converts uncaught throws into 404, which broke
  // every non-prerendered /services/{svc}/ render before this fix.
  const faqParams = { area: locale === 'zh' ? '温哥华' : 'Vancouver' };
  const safeFaq = (key: string): string => {
    try { return faqT(key, faqParams); }
    catch { return ''; }
  };
  const faqs = [
    { question: safeFaq(`${serviceSlug}.q1`), answer: safeFaq(`${serviceSlug}.a1`) },
    { question: safeFaq(`${serviceSlug}.q2`), answer: safeFaq(`${serviceSlug}.a2`) },
    { question: safeFaq(`${serviceSlug}.q3`), answer: safeFaq(`${serviceSlug}.a3`) },
  ].filter((f) => f.question && f.answer);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      {/* Use long_description in schema only when the current locale has a
          genuine translation (not a pickLocale en-fallback). Otherwise use
          the short description, which IS localized via the localizations jsonb.
          This prevents English long-form copy bleeding into /es/, /ja/, /ko/
          schema even when the service title and short description are native. */}
      <ServiceSchema
        company={company}
        serviceName={localizedService.title}
        serviceDescription={
          (service.long_description as { [k: string]: string | undefined } | undefined)?.[locale]
            ?? localizedService.description
        }
        url={`/${locale}/services/${serviceSlug}/`}
        areaServed={areas.map((a) => a.name.en)}
        priceRange={SERVICE_PRICE_RANGES[serviceSlug]}
        image={service.image || siteImages.hero}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
        serviceRadiusKm={50}
        locale={locale}
      />
      <FAQSchema faqs={faqs} locale={locale} />
      <ServiceDetailPage
        locale={locale as Locale}
        serviceSlug={serviceSlug as ServiceType}
        company={company}
        service={service}
        areas={areas}
        faqs={faqs}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
    </>
  );
}
