import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import ContactPage from '@/components/pages/ContactPage';
import { BreadcrumbSchema, ContactPageSchema, FAQSchema } from '@/components/structured-data';
import { localeSelfName, nativeSupportLanguageList } from '@/lib/i18n/language-names';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, pickLocale, buildAlternateLocales} from '@/lib/utils';
import { getCompanyFromDb, getServiceAreasFromDb, getPropertyTypesFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/contact/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/contact/`,
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

  const t = await getTranslations({ locale, namespace: 'nav' });
  const tContact = await getTranslations({ locale, namespace: 'contact' });
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('contact'), url: `/${locale}/contact/` },
  ];

  const [company, areas, propertyTypes, googleReviews] = await Promise.all([
    getCompanyFromDb(),
    getServiceAreasFromDb(),
    getPropertyTypesFromDb(),
    getGoogleReviews(),
  ]);
  const areaNames = areas.map((a) => pickLocale(a.name, locale as Locale));
  const cityOptions = areas.map((a) => ({
    slug: a.slug,
    name: pickLocale(a.name, locale as Locale),
  }));
  const propertyTypeOptions = propertyTypes.map((p) => ({
    slug: p.slug,
    name: locale === 'zh' ? p.name.zh : p.name.en,
  }));

  // Resolved here (Server Component → Node's full ICU), never in the client
  // LanguageSupportNotice — browser Intl.DisplayNames/ListFormat coverage
  // varies by build and silently mis-resolves for locales like `pa`.
  const languageSupport = {
    language: localeSelfName(locale as Locale),
    supported: nativeSupportLanguageList(locale as Locale),
  };

  // Contact-specific FAQ — these mirror, verbatim, the visible Q&A section
  // rendered by ContactPage (same faqQ*/faqA* keys), which is Google's
  // requirement for FAQPage markup. Note FAQ rich results were restricted to
  // government/health sites in Aug 2023, so this does not produce SERP
  // accordions; the value is machine-readable Q&A for AI answer engines and
  // Bing, consistent with the other pages that already emit FAQPage.
  const contactFaqs = [
    { question: tContact('faqQ1'), answer: tContact('faqA1') },
    { question: tContact('faqQ2'), answer: tContact('faqA2') },
    { question: tContact('faqQ3'), answer: tContact('faqA3') },
    { question: tContact('faqQ4'), answer: tContact('faqA4') },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <ContactPageSchema company={company} areaNames={areaNames} locale={locale} />
      <FAQSchema faqs={contactFaqs} locale={locale} />
      <ContactPage
        company={company}
        areaNames={areaNames}
        cityOptions={cityOptions}
        propertyTypeOptions={propertyTypeOptions}
        googleRating={googleReviews.rating}
        languageSupport={languageSupport}
      />
    </>
  );
}
