import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import ShowroomPage from '@/components/pages/ShowroomPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.showroom' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/showroom/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/showroom/`,
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

  const [nav, mt, t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'metadata.showroom' }),
    getTranslations({ locale, namespace: 'showroomPage' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('showroom'), url: `/${locale}/showroom/` },
  ];

  const faqs = [
    { id: 'showroom-faq1', question: t('faq1q'), answer: t('faq1a') },
    { id: 'showroom-faq2', question: t('faq2q'), answer: t('faq2a') },
    { id: 'showroom-faq3', question: t('faq3q'), answer: t('faq3a') },
    { id: 'showroom-faq4', question: t('faq4q'), answer: t('faq4a') },
    { id: 'showroom-faq5', question: t('faq5q'), answer: t('faq5a') },
    { id: 'showroom-faq6', question: t('faq6q'), answer: t('faq6a') },
    { id: 'showroom-faq7', question: t('faq7q'), answer: t('faq7a') },
    { id: 'showroom-faq8', question: t('faq8q'), answer: t('faq8a') },
  ];

  const localizedShowroom = {
    address: company.address,
    phone: company.phone,
    email: company.email,
  };

  const translations = {
    heroTitle: t('heroTitle'),
    heroSubtitle: t('heroSubtitle'),
    appointmentPrefix: t('appointmentPrefix'),
    appointmentBold: t('appointmentBold'),
    addressTitle: t('addressTitle'),
    phoneTitle: t('phoneTitle'),
    emailTitle: t('emailTitle'),
    hoursTitle: t('hoursTitle'),
    hoursValue: t('hoursValue'),
    mapTitle: t('mapTitle'),
    faqTitle: t('faqTitle'),
    ctaTitle: t('ctaTitle'),
    ctaDescription: t('ctaDescription'),
    bookConsultation: t('bookConsultation'),
    callUs: t('callUs'),
  };

  // Share URL is DERIVED from the canonical (same path string generateMetadata
  // passes to buildAlternates above) rather than rebuilt, so the two cannot
  // drift apart when a routing rule changes. Title/image come from the same
  // metadata.showroom namespace generateMetadata builds the OG card from, so the
  // share card and the OG card cannot disagree either.
  const shareUrl = buildAlternates('/showroom/', locale).canonical;
  const shareImage = buildOgImageUrl(mt('title'), mt('description'));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ShowroomPage
        locale={locale as Locale}
        company={company}
        showroom={localizedShowroom}
        faqs={faqs}
        translations={translations}
        share={{ url: shareUrl, title: mt('title'), imageUrl: shareImage }}
      />
    </>
  );
}
