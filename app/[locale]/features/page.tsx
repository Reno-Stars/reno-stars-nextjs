import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import FeaturesPage from '@/components/pages/FeaturesPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}


export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.features' }),
    getCompanyFromDb(),
  ]);
  const years = { years: company.yearsExperience };

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description', years));

  return {
    title: t('title'),
    description: t('description', years),
    alternates: buildAlternates('/features/', locale),
    openGraph: {
      title: t('title'),
      description: t('description', years),
      url: `${baseUrl}/${locale}/features/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description', years),
      images: [{ url: ogImage, alt: t('title') }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'features' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('features'), url: `/${locale}/features/` },
  ];

  const faqs = [
    { question: t('foundation.items.coverage.title'), answer: t('foundation.items.coverage.description') },
    { question: t('foundation.items.rating.title'), answer: t('foundation.items.rating.description') },
    { question: t('foundation.items.team.title'), answer: t('foundation.items.team.description') },
    { question: t('foundation.items.service.title'), answer: t('foundation.items.service.description') },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <FeaturesPage company={company} />
    </>
  );
}
