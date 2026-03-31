import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ShowroomPage from '@/components/pages/ShowroomPage';
import { BreadcrumbSchema, FAQSchema, LocalBusinessSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb, getServiceAreasFromDb, getSocialLinksFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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

  const [nav, t, company, areas, socialLinks, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'showroomPage' }),
    getCompanyFromDb(),
    getServiceAreasFromDb(),
    getSocialLinksFromDb(),
    getGoogleReviews(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('showroom'), url: `/${locale}/showroom/` },
  ];

  const faqs = [
    { question: t('faq1q'), answer: t('faq1a') },
    { question: t('faq2q'), answer: t('faq2a') },
    { question: t('faq3q'), answer: t('faq3a') },
    { question: t('faq4q'), answer: t('faq4a') },
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
    ctaTitle: t('ctaTitle'),
    ctaDescription: t('ctaDescription'),
    bookConsultation: t('bookConsultation'),
    callUs: t('callUs'),
  };

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <LocalBusinessSchema
        company={company}
        socialLinks={socialLinks}
        areas={areas}
        googleRating={googleReviews.rating}
        googleReviewCount={googleReviews.userRatingCount}
      />
      <FAQSchema faqs={faqs} />
      <ShowroomPage
        company={company}
        showroom={localizedShowroom}
        translations={translations}
      />
    </>
  );
}
