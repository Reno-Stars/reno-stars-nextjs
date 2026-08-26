import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import TransparentPricingPage from '@/components/pages/TransparentPricingPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import JsonLd from '@/components/structured-data/JsonLd';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const FAQ_KEYS = [1, 2, 3, 4] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.transparentPricing' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/transparent-pricing/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/transparent-pricing/`,
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

  const [nav, t] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'transparentPricing' }),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: t('breadcrumb'), url: `/${locale}/transparent-pricing/` },
  ];

  const faqs = FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  const baseUrl = getBaseUrl();
  // A WebPage node rather than a Service/Offer one: this page explains HOW we
  // price, and carries no price. Emitting an Offer without a real
  // priceSpecification is the exact shape Google flags as misleading markup.
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    description: t('hero.subtitle'),
    url: `${baseUrl}/${locale}/transparent-pricing/`,
    inLanguage: locale,
    about: { '@id': `${baseUrl}/#organization` },
    publisher: { '@id': `${baseUrl}/#organization` },
  };

  /*
   * No <ClientMessages> wrapper on purpose.
   *
   * TransparentPricingPage is a Server Component — it reads its strings through
   * next-intl's server path, which never touches the RSC client payload. Adding
   * `ns={['transparentPricing']}` here would serialize the whole namespace into
   * every request for nothing. The same reason /careers ships without one.
   * If this page ever gains an interactive ('use client') child that calls
   * useTranslations, wrap it then — client-namespace-scope.test.ts will say so.
   */
  return (
    <>
      <JsonLd data={webPageSchema} />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} locale={locale} />
      <TransparentPricingPage locale={locale as Locale} />
    </>
  );
}
