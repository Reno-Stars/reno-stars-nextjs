import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ContactPage from '@/components/pages/ContactPage';
import { BreadcrumbSchema, ContactPageSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

  const baseUrl = getBaseUrl();

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/contact/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/contact/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      type: 'website',
      images: [{ url: siteImages.hero, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{ url: siteImages.hero, alt: t('title') }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('contact'), url: `/${locale}/contact/` },
  ];

  const [company, areas, googleReviews] = await Promise.all([getCompanyFromDb(), getServiceAreasFromDb(), getGoogleReviews()]);
  const areaNames = areas.map((a) => a.name[locale as Locale]);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ContactPageSchema company={company} areaNames={areaNames} />
      <ContactPage company={company} areaNames={areaNames} googleRating={googleReviews.rating} />
    </>
  );
}
