import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import DesignPage from '@/components/pages/DesignPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getDesignsFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.design' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/design/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/design/`,
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

  const [nav, faqT, company, designs] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'designFaqs' }),
    getCompanyFromDb(),
    getDesignsFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('design'), url: `/${locale}/design/` },
  ];

  const faqs = [
    { id: 'design-faq1', question: faqT('q1'), answer: faqT('a1') },
    { id: 'design-faq2', question: faqT('q2'), answer: faqT('a2') },
    { id: 'design-faq3', question: faqT('q3'), answer: faqT('a3') },
    { id: 'design-faq4', question: faqT('q4'), answer: faqT('a4') },
    { id: 'design-faq5', question: faqT('q5'), answer: faqT('a5') },
    { id: 'design-faq6', question: faqT('q6'), answer: faqT('a6') },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <DesignPage
        locale={locale as Locale}
        company={company}
        designs={designs}
        faqs={faqs}
        faqTitle={faqT('faqTitle')}
      />
    </>
  );
}
