import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ProcessPage from '@/components/pages/ProcessPage';
import { BreadcrumbSchema, FAQSchema, HowToSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.process' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/process/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/process/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
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

  const [nav, t, company, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'process' }),
    getCompanyFromDb(),
    getGoogleReviews(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('process'), url: `/${locale}/process/` },
  ];

  // FAQs based on the 5 steps
  const faqs = [
    { question: t('step1.title'), answer: t('step1.faqAnswer') },
    { question: t('step2.title'), answer: t('step2.faqAnswer') },
    { question: t('step3.title'), answer: t('step3.faqAnswer') },
    { question: t('step4.title'), answer: t('step4.faqAnswer') },
    { question: t('step5.title'), answer: t('step5.faqAnswer') },
  ];

  // HowTo steps for structured data
  const howToSteps = faqs.map((faq) => ({
    name: faq.question,
    text: faq.answer,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <HowToSchema
        name={t('hero.title')}
        description={t('whyMatters.description')}
        steps={howToSteps}
      />
      <ProcessPage company={company} locale={locale as Locale} googleRating={googleReviews.rating} />
    </>
  );
}
