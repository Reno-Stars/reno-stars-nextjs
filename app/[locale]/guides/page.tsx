import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import GuidesIndexPage from '@/components/pages/GuidesIndexPage';
import { BreadcrumbSchema, FAQSchema, ItemListSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 604800; // 7d — Vercel quota optimization

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/`,
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

const GUIDE_SLUGS = [
  'kitchen-renovation-cost-vancouver',
  'bathroom-renovation-cost-vancouver',
  'whole-house-renovation-cost-vancouver',
  'basement-renovation-cost-vancouver',
  'commercial-renovation-cost-vancouver',
  'cabinet-refinishing-cost-vancouver',
  'basement-suite-cost-vancouver',
] as const;

const GUIDE_KEYS = ['kitchen', 'bathroom', 'wholeHouse', 'basement', 'commercial', 'cabinet', 'basementSuite'] as const;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [nav, t] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.index' }),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
  ];

  const itemListItems = GUIDE_SLUGS.map((slug, i) => ({
    name: t(`${GUIDE_KEYS[i]}.title`),
    url: `/${locale}/guides/${slug}/`,
  }));

  const faqs = (['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((k) => ({
    question: t(`faqs.${k}.question`),
    answer: t(`faqs.${k}.answer`),
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ItemListSchema
        items={itemListItems}
        name={t('hero.title')}
        description={t('hero.subtitle')}
      />
      <FAQSchema faqs={faqs} />
      <GuidesIndexPage locale={locale as Locale} />
    </>
  );
}
