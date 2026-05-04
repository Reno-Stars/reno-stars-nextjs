import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import CabinetRefinishingCostGuidePage from '@/components/pages/CabinetRefinishingCostGuidePage';
import { ArticleSchema, BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCabinetProjectsForGuide, getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 2592000; // 30d — Vercel ISR write reduction

export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.cabinetCost' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/cabinet-refinishing-cost-vancouver/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/cabinet-refinishing-cost-vancouver/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'article',
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

  let projects: Awaited<ReturnType<typeof getCabinetProjectsForGuide>>;
  try {
    projects = await getCabinetProjectsForGuide();
  } catch {
    projects = [];
  }

  const [nav, t, mt, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.cabinetCost' }),
    getTranslations({ locale, namespace: 'metadata.guides.cabinetCost' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/cabinet-refinishing-cost-vancouver/` },
  ];

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ArticleSchema
        company={company}
        headline={mt('title')}
        description={mt('description')}
        url={`/${locale}/guides/cabinet-refinishing-cost-vancouver/`}
        authorName={`${company.name} Team`}
        locale={locale}
      />
      <CabinetRefinishingCostGuidePage locale={locale as Locale} projects={projects} />
    </>
  );
}
