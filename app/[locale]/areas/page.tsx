import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import AreasPage from '@/components/pages/AreasPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getServiceAreasFromDb } from '@/lib/db/queries';

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

  const [company, areas, aboutT] = await Promise.all([
    getCompanyFromDb(),
    getServiceAreasFromDb(),
    getTranslations({ locale, namespace: 'aboutPage' }),
  ]);

  const t = await getTranslations({ locale, namespace: 'nav' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('areas'), url: `/${locale}/areas/` },
  ];

  // Service-area hub page FAQs — loaded from aboutPage translation keys so they
  // are localized for every locale. Mirrors the pattern used by services/page.tsx.
  const areasFaqs = [1, 2]
    .map((i) => ({
      question: aboutT(`faq.areasQ${i}`),
      answer: aboutT(`faq.areasA${i}`),
    }))
    .filter(
      ({ question, answer }) =>
        !question.startsWith('aboutPage.') &&
        question.length > 0 &&
        answer.length > 0,
    );

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={areasFaqs} locale={locale} />
      <AreasPage locale={locale as Locale} areas={areas} company={company} areasFaqs={areasFaqs} />
    </>
  );
}
