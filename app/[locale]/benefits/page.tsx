import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import BenefitsPage from '@/components/pages/BenefitsPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.benefits' });

  const baseUrl = getBaseUrl();

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/benefits/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/benefits/`,
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

  const nav = await getTranslations({ locale, namespace: 'nav' });
  const t = await getTranslations({ locale, namespace: 'benefits' });
  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('benefits'), url: `/${locale}/benefits/` },
  ];

  const faqs = [
    { question: t('experience.title'), answer: t('experience.description') },
    { question: t('warranty.title'), answer: t('warranty.description') },
    { question: t('coverage.title'), answer: t('coverage.description') },
    { question: t('rating.title'), answer: t('rating.description') },
    { question: t('team.title'), answer: t('team.description') },
    { question: t('service.title'), answer: t('service.description') },
  ];

  const company = await getCompanyFromDb();

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <BenefitsPage locale={locale as Locale} company={company} />
    </>
  );
}
