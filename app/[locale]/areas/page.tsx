import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import AreasPage from '@/components/pages/AreasPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import ClientMessages from '@/components/ClientMessages';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.areas' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/areas/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/areas/`,
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

  const [company, areas] = await Promise.all([
    getCompanyFromDb(),
    getServiceAreasFromDb(),
  ]);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('areas'), url: `/${locale}/areas/` },
  ];

  const areasFaqs = [
    {
      question: 'What renovation services does Reno Stars offer in Metro Vancouver?',
      answer: 'Reno Stars offers kitchen, bathroom, basement, whole-house, and commercial renovations across Metro Vancouver including Vancouver, Richmond, Burnaby, Surrey, and 13 other communities.',
    },
    {
      question: 'How much does a renovation cost in Metro Vancouver?',
      answer: 'Kitchen renovations in Vancouver typically range from $30,000-$80,000+. Bathroom renovations range from $20,000-$60,000+. Basement renovations start around $50,000 for legal suites.',
    },
  ];

  return (
    <ClientMessages ns={['areas', 'cta', 'projects']}>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={areasFaqs} locale={locale} />
      <AreasPage locale={locale as Locale} areas={areas.map((a) => ({ id: a.id, slug: a.slug, name: a.name, description: a.description }))} company={company} areasFaqs={areasFaqs} />
    </ClientMessages>
  );
}
