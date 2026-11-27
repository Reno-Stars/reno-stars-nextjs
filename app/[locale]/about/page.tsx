import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import AboutPage from '@/components/pages/AboutPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales } from '@/lib/utils';
import { getCompanyFromDb, getTrustBadgesFromDb } from '@/lib/db/queries';
import ClientMessages from '@/components/ClientMessages';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/about/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/about/`,
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

  const [nav, t, company, badges] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'aboutPage' }),
    getCompanyFromDb(),
    getTrustBadgesFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('about'), url: `/${locale}/about/` },
  ];

  const ABOUT_FAQ_KEYS = [1, 2, 3, 4, 5] as const;
  // The faq.a* answers no longer carry a {years} placeholder (founded 2021, no
  // experience-years claim — Ryan 2026-11-26).
  const faqs = ABOUT_FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  const baseUrl = getBaseUrl();
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${company.name} — Vancouver Renovations Since ${company.foundingYear}`,
    description: `Learn about ${company.name}, Metro Vancouver's renovation contractor since ${company.foundingYear}, with ${company.projectsCompleted} projects completed, $5M CGL insurance, and active WCB coverage.`,
    url: `${baseUrl}/${locale}/about/`,
    inLanguage: locale,
    mainEntity: { '@id': `${baseUrl}/#organization` },
  };

  return (
    <ClientMessages ns={['aboutPage']}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema).replace(/</g, '\\u003c') }}
      />
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <AboutPage
        locale={locale as Locale}
        company={company}
        badges={badges}
      />
    </ClientMessages>
  );
}
