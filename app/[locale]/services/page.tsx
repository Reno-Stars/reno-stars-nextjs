import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ServicesPage from '@/components/pages/ServicesPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getServicesFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.services' });

  const baseUrl = getBaseUrl();

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/services/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/services/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'website',
      images: [{ url: siteImages.hero }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [company, services] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
  ]);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('services'), url: `/${locale}/services/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ServicesPage locale={locale as Locale} company={company} services={services} />
    </>
  );
}
