import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService, serviceTypeToCategory } from '@/lib/data/services';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb } from '@/lib/db/queries';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import { BreadcrumbSchema, ServiceSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string }>;
}

const SERVICE_SLUGS = Object.keys(serviceTypeToCategory) as ServiceType[];

export function generateStaticParams() {
  const params: { locale: string; 'service-slug': string }[] = [];

  for (const locale of locales) {
    for (const slug of SERVICE_SLUGS) {
      params.push({ locale, 'service-slug': slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug } = await params;
  const services = await getServicesFromDb();
  const service = services.find((s) => s.slug === serviceSlug);

  if (!service) {
    return { title: 'Service Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const baseUrl = getBaseUrl();
  const description = truncateMetaDescription(localizedService.long_description || localizedService.description);

  const ogImage = service.image || siteImages.hero;

  return {
    title: `${localizedService.title} | ${SITE_NAME}`,
    description,
    alternates: buildAlternates(`/services/${serviceSlug}/`, locale),
    openGraph: {
      title: `${localizedService.title} | ${SITE_NAME}`,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${localizedService.title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, 'service-slug': serviceSlug } = await params;
  setRequestLocale(locale);

  const [company, services] = await Promise.all([getCompanyFromDb(), getServicesFromDb()]);
  const service = services.find((s) => s.slug === serviceSlug);

  if (!service) {
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

  // Build FAQs for this service type
  const faqs = [
    { question: faqT(`${serviceSlug}.q1`), answer: faqT(`${serviceSlug}.a1`) },
    { question: faqT(`${serviceSlug}.q2`), answer: faqT(`${serviceSlug}.a2`) },
    { question: faqT(`${serviceSlug}.q3`), answer: faqT(`${serviceSlug}.a3`) },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ServiceSchema
        company={company}
        serviceName={localizedService.title}
        serviceDescription={localizedService.long_description || localizedService.description}
        url={`/${locale}/services/${serviceSlug}/`}
      />
      <FAQSchema faqs={faqs} />
      <ServiceDetailPage locale={locale as Locale} serviceSlug={serviceSlug as ServiceType} company={company} service={service} />
    </>
  );
}
