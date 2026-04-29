import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
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

export const revalidate = 604800; // 7d — Vercel quota optimization

// Build-time prerender: EN only. Non-EN locales lazy-generate via
// dynamicParams=true and cache for 7d. ~7 EN pages instead of 70.
export async function generateStaticParams() {
  const services = await getServicesFromDb();
  return services
    .filter((s) => s.showOnServicesPage !== false)
    .map((service) => ({ locale: 'en', 'service-slug': service.slug }));
}

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

  // Build FAQs for this service type (general page defaults to Vancouver)
  const faqParams = { area: locale === 'zh' ? '温哥华' : 'Vancouver' };
  const faqs = [
    { question: faqT(`${serviceSlug}.q1`, faqParams), answer: faqT(`${serviceSlug}.a1`, faqParams) },
    { question: faqT(`${serviceSlug}.q2`, faqParams), answer: faqT(`${serviceSlug}.a2`, faqParams) },
    { question: faqT(`${serviceSlug}.q3`, faqParams), answer: faqT(`${serviceSlug}.a3`, faqParams) },
  ];

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
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <FAQSchema faqs={faqs} />
      <ServiceDetailPage locale={locale as Locale} serviceSlug={serviceSlug as ServiceType} company={company} service={service} areas={areas} faqs={faqs} />
    </>
  );
}
