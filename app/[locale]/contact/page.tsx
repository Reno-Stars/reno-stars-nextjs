import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import ContactPage from '@/components/pages/ContactPage';
import { BreadcrumbSchema, ContactPageSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getServiceAreasFromDb, getPropertyTypesFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

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
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{ url: ogImage, alt: t('title') }],
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

  const [company, areas, propertyTypes, googleReviews] = await Promise.all([
    getCompanyFromDb(),
    getServiceAreasFromDb(),
    getPropertyTypesFromDb(),
    getGoogleReviews(),
  ]);
  const areaNames = areas.map((a) => pickLocale(a.name, locale as Locale));
  const cityOptions = areas.map((a) => ({
    slug: a.slug,
    name: pickLocale(a.name, locale as Locale),
  }));
  const propertyTypeOptions = propertyTypes.map((p) => ({
    slug: p.slug,
    name: locale === 'zh' ? p.name.zh : p.name.en,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <ContactPageSchema company={company} areaNames={areaNames} locale={locale} />
      <ContactPage
        company={company}
        areaNames={areaNames}
        cityOptions={cityOptions}
        propertyTypeOptions={propertyTypeOptions}
        googleRating={googleReviews.rating}
      />
    </>
  );
}
