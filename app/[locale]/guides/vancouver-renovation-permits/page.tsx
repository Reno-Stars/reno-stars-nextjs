import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, isIndexableLeafLocale, INDEXABLE_LEAF_LOCALES, type Locale } from '@/i18n/config';
import PermitGuidePage from '@/components/pages/PermitGuidePage';
import { ArticleSchema, BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales } from '@/lib/utils';
import { getCompanyFromDb } from '@/lib/db/queries';
import ClientMessages from '@/components/ClientMessages';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.permit' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  const isIndexableLocale = isIndexableLeafLocale(locale);

  return {
    title: t('title'),
    description: t('description'),
    ...(isIndexableLocale ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates('/guides/vancouver-renovation-permits/', locale, INDEXABLE_LEAF_LOCALES),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/vancouver-renovation-permits/`,
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

  const [nav, t, mt, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.permit' }),
    getTranslations({ locale, namespace: 'metadata.guides.permit' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/vancouver-renovation-permits/` },
  ];

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
  ];

  const shareUrl = buildAlternates('/guides/vancouver-renovation-permits/', locale).canonical;
  const ogImage = buildOgImageUrl(mt('title'), mt('description'));

  return (
    <ClientMessages ns={['cta', 'guides.permit', 'share']}>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ArticleSchema
        company={company}
        headline={mt('title')}
        description={mt('description')}
        url={`/${locale}/guides/vancouver-renovation-permits/`}
        authorName={`${company.name} Team`}
        datePublished="2026-08-04"
        dateModified="2026-08-04"
        image={ogImage}
        locale={locale}
      />
      <PermitGuidePage
        locale={locale as Locale}
        phone={company.phone}
        share={{ url: shareUrl, title: mt('title'), imageUrl: ogImage }}
      />
    </ClientMessages>
  );
}
