import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, isIndexableLeafLocale, INDEXABLE_LEAF_LOCALES, type Locale } from '@/i18n/config';
import BathroomCostGuidePage from '@/components/pages/BathroomCostGuidePage';
import { ArticleSchema, BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales} from '@/lib/utils';
import { getBathroomProjectsForGuide, getCompanyFromDb } from '@/lib/db/queries';
import ClientMessages from '@/components/ClientMessages';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides.bathroomCost' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  const isIndexableLocale = isIndexableLeafLocale(locale);

  return {
    title: t('title'),
    description: t('description'),
    ...(isIndexableLocale ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates('/guides/bathroom-renovation-cost-vancouver/', locale, INDEXABLE_LEAF_LOCALES),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/bathroom-renovation-cost-vancouver/`,
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

  const [nav, t, mt, projects, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'guides.bathroomCost' }),
    getTranslations({ locale, namespace: 'metadata.guides.bathroomCost' }),
    getBathroomProjectsForGuide(),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
    { name: t('breadcrumb'), url: `/${locale}/guides/bathroom-renovation-cost-vancouver/` },
  ];

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    // q6 added 2026-06-02 — mirrors kitchen cost-guide commit 48f60e3.
    // 2026-06-01 GSC scan all_rows shows "remodel" terminology demand
    // across bathroom-cost queries (separate Google-treated lexicon from
    // "renovation"): "bathroom remodel cost" (32 imp), "bathroom remodel
    // vancouver" (~13 imp on guide), "bathroom remodeling cost" (12 imp),
    // "bath remodel cost" (8 imp), "average cost of a master bathroom
    // remodel" (6 imp). ~71 imp/28d combined exact-match opportunity that
    // existing q1 (renovation-terminology) misses. All 14 locales populated.
    { question: t('faq.q6'), answer: t('faq.a6') },
    // q7-q8 added 2026-06-25 for parity with other 6 cost guides (all now at 8 FAQs).
    // q7 targets "bathroom plumbing relocation cost vancouver" long-tail.
    // q8 targets "luxury bathroom renovation vancouver" / high-end ensuite queries.
    { question: t('faq.q7'), answer: t('faq.a7') },
    { question: t('faq.q8'), answer: t('faq.a8') },
  ];

  // Share URL is DERIVED from the canonical (same path string generateMetadata
  // passes to buildAlternates above) rather than rebuilt, so the two cannot
  // drift apart when a routing rule changes.
  const shareUrl = buildAlternates('/guides/bathroom-renovation-cost-vancouver/', locale).canonical;
  const ogImage = buildOgImageUrl(mt('title'), mt('description'));

  return (
    <ClientMessages ns={['cta', 'guides.bathroomCost', 'guides.relatedGuides', 'share']}>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <FAQSchema faqs={faqs} locale={locale} />
      <ArticleSchema
        company={company}
        headline={mt('title')}
        description={mt('description')}
        url={`/${locale}/guides/bathroom-renovation-cost-vancouver/`}
        authorName={`${company.name} Team`}
        datePublished="2026-02-03"
        dateModified="2026-06-25"
        image={ogImage}
        locale={locale}
      />
      <BathroomCostGuidePage
        locale={locale as Locale}
        projects={projects}
        phone={company.phone}
        share={{ url: shareUrl, title: mt('title'), imageUrl: ogImage }}
      />
    </ClientMessages>
  );
}
