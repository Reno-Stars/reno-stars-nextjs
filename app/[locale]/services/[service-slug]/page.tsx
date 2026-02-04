import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService, serviceTypeToCategory } from '@/lib/data/services';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb } from '@/lib/db/queries';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import { BreadcrumbSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
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

  return {
    title: `${localizedService.title} | ${SITE_NAME}`,
    description: localizedService.long_description || localizedService.description,
    alternates: buildAlternates(`/services/${serviceSlug}/`, locale),
    openGraph: {
      title: `${localizedService.title} | ${SITE_NAME}`,
      description: localizedService.description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'website',
      images: [{ url: service.image || siteImages.hero }],
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

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
    { name: localizedService.title, url: `/${locale}/services/${serviceSlug}/` },
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
      <ServiceDetailPage locale={locale as Locale} serviceSlug={serviceSlug as ServiceType} company={company} service={service} />
    </>
  );
}
