import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import BenefitsPage from '@/components/pages/BenefitsPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'metadata.benefits' }),
    getCompanyFromDb(),
  ]);
  const years = { years: company.yearsExperience };

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description', years));

  return {
    title: t('title'),
    description: t('description', years),
    alternates: buildAlternates('/benefits/', locale),
    openGraph: {
      title: t('title'),
      description: t('description', years),
      url: `${baseUrl}/${locale}/benefits/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
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
    getTranslations({ locale, namespace: 'benefits' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('benefits'), url: `/${locale}/benefits/` },
  ];

  const faqs = [
    { question: t('coverage.title'), answer: t('coverage.description') },
    { question: t('rating.title'), answer: t('rating.description') },
    { question: t('team.title'), answer: t('team.description') },
    { question: t('service.title'), answer: t('service.description') },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <BenefitsPage company={company} />
    </>
  );
}
