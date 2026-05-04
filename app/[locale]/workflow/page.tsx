import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import ProcessPage from '@/components/pages/ProcessPage';
import { BreadcrumbSchema, FAQSchema, HowToSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 2592000; // 30d — Vercel ISR write reduction

export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.process' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/workflow/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/workflow/`,
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

  const [nav, t, company, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'process' }),
    getCompanyFromDb(),
    getGoogleReviews(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('process'), url: `/${locale}/workflow/` },
  ];

  // FAQs based on the 5 steps
  const faqs = [
    { question: t('step1.title'), answer: t('step1.faqAnswer') },
    { question: t('step2.title'), answer: t('step2.faqAnswer') },
    { question: t('step3.title'), answer: t('step3.faqAnswer') },
    { question: t('step4.title'), answer: t('step4.faqAnswer') },
    { question: t('step5.title'), answer: t('step5.faqAnswer') },
  ];

  const baseUrl = getBaseUrl();
  const howToSteps = [
    { name: t('step1.title'), text: t('step1.faqAnswer'), url: `${baseUrl}/${locale}/workflow/#step-1` },
    { name: t('step2.title'), text: t('step2.faqAnswer'), url: `${baseUrl}/${locale}/workflow/#step-2` },
    { name: t('step3.title'), text: t('step3.faqAnswer'), url: `${baseUrl}/${locale}/workflow/#step-3` },
    { name: t('step4.title'), text: t('step4.faqAnswer'), url: `${baseUrl}/${locale}/workflow/#step-4` },
    { name: t('step5.title'), text: t('step5.faqAnswer'), url: `${baseUrl}/${locale}/workflow/#step-5` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <HowToSchema
        name={locale === 'zh' ? '温哥华装修流程：5个步骤' : 'Vancouver Home Renovation: 5-Step Process'}
        description={locale === 'zh'
          ? '从免费咨询到项目交付的完整装修流程。了解如何规划、设计和执行您的温哥华家居装修。'
          : 'Complete renovation workflow from free consultation to project handover. Learn how to plan, design, and execute your Vancouver home renovation.'}
        totalTime="P8W"
        steps={howToSteps}
      />
      <ProcessPage company={company} locale={locale as Locale} googleRating={googleReviews.rating} />
    </>
  );
}
