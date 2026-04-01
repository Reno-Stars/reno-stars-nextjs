import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import AboutPage from '@/components/pages/AboutPage';
import { BreadcrumbSchema, FAQSchema, OrganizationSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb, getTrustBadgesFromDb, getSocialLinksFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import { getYearsExperience } from '@/lib/company-config';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });

  const baseUrl = getBaseUrl();
  const years = { years: getYearsExperience() };
  const ogImage = buildOgImageUrl(t('title'), t('description', years));

  return {
    title: t('title'),
    description: t('description', years),
    alternates: buildAlternates('/about/', locale),
    openGraph: {
      title: t('title'),
      description: t('description', years),
      url: `${baseUrl}/${locale}/about/`,
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

  const [nav, t, company, badges, socialLinks, areas] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'aboutPage' }),
    getCompanyFromDb(),
    getTrustBadgesFromDb(),
    getSocialLinksFromDb(),
    getServiceAreasFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('about'), url: `/${locale}/about/` },
  ];

  const ABOUT_FAQ_KEYS = [1, 2, 3, 4, 5] as const;
  const faqs = ABOUT_FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <OrganizationSchema company={company} socialLinks={socialLinks} areas={areas} />
      <AboutPage
        locale={locale as Locale}
        company={company}
        badges={badges}
      />
    </>
  );
}
