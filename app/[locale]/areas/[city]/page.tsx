import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getServiceAreaBySlug, getServiceAreas, getLocalizedArea } from '@/lib/data/areas';
import AreaPage from '@/components/pages/AreaPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { getLocalizedService } from '@/lib/data/services';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getServicesFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; city: string }>;
}

export function generateStaticParams() {
  const areas = getServiceAreas();
  const params: { locale: string; city: string }[] = [];

  for (const locale of locales) {
    for (const area of areas) {
      params.push({ locale, city: area.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, city } = await params;
  const area = getServiceAreaBySlug(city);

  if (!area) {
    return { title: 'Area Not Found', robots: { index: false, follow: false } };
  }

  const localizedArea = getLocalizedArea(area, locale as Locale);
  const baseUrl = getBaseUrl();

  const t = await getTranslations({ locale, namespace: 'metadata.area' });
  const title = t('title', { area: localizedArea.name });
  const description = localizedArea.description || t('description', { area: localizedArea.name });

  return {
    title,
    description,
    alternates: buildAlternates(`/areas/${city}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/areas/${city}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'website',
      images: [{ url: siteImages.hero }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, city } = await params;
  setRequestLocale(locale);

  const area = getServiceAreaBySlug(city);

  if (!area) {
    notFound();
  }

  const localizedArea = getLocalizedArea(area, locale as Locale);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: localizedArea.name, url: `/${locale}/areas/${city}/` },
  ];

  const [company, services] = await Promise.all([getCompanyFromDb(), getServicesFromDb()]);
  const localizedServices = services.map((s) => getLocalizedService(s, locale as Locale));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <AreaPage locale={locale as Locale} citySlug={city} company={company} services={localizedServices} />
    </>
  );
}
