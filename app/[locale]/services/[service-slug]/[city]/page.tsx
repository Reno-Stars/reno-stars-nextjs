import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedService, serviceTypeToCategory } from '@/lib/data/services';
import { getLocalizedArea } from '@/lib/data/areas';
import type { ServiceType } from '@/lib/types';
import { getCompanyFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import ServiceLocationPage from '@/components/pages/ServiceLocationPage';
import { BreadcrumbSchema, ServiceSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';

interface PageProps {
  params: Promise<{ locale: string; 'service-slug': string; city: string }>;
}

const SERVICE_SLUGS = Object.keys(serviceTypeToCategory) as ServiceType[];

export async function generateStaticParams() {
  const areas = await getServiceAreasFromDb();
  const params: { locale: string; 'service-slug': string; city: string }[] = [];

  for (const locale of locales) {
    for (const slug of SERVICE_SLUGS) {
      for (const area of areas) {
        params.push({ locale, 'service-slug': slug, city: area.slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, 'service-slug': serviceSlug, city } = await params;
  const [services, areas] = await Promise.all([getServicesFromDb(), getServiceAreasFromDb()]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);
  const baseUrl = getBaseUrl();

  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.serviceLocation' }),
    getCompanyFromDb(),
  ]);
  const tParams = { service: localizedService.title, area: localizedArea.name, years: company.yearsExperience };
  const title = t('title', tParams);
  const description = t('description', tParams);
  const ogImage = service.image || siteImages.hero;

  return {
    title,
    description,
    alternates: buildAlternates(`/services/${serviceSlug}/${city}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/services/${serviceSlug}/${city}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
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

  const [company, services, areas] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
  ]);
  const service = services.find((s) => s.slug === serviceSlug);
  const area = areas.find((a) => a.slug === city);

  if (!service || !area) {
    notFound();
  }
  const localizedService = getLocalizedService(service, locale as Locale);
  const localizedArea = getLocalizedArea(area, locale as Locale);

  const t = await getTranslations({ locale, namespace: 'nav' });
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
      <BreadcrumbSchema items={breadcrumbs} />
      <ServiceSchema
        company={company}
        serviceName={serviceTitle}
        serviceDescription={localizedService.long_description || localizedService.description}
        location={localizedArea.name}
        url={`/${locale}/services/${serviceSlug}/${city}/`}
      />
      <ServiceLocationPage
        locale={locale as Locale}
        serviceSlug={serviceSlug as ServiceType}
        citySlug={city}
        company={company}
        service={service}
        area={area}
      />
    </>
  );
}
