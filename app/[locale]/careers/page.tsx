import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import CareersPage from '@/components/pages/CareersPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import JobPostingSchema from '@/components/structured-data/JobPostingSchema';
import { getCompanyFromDb } from '@/lib/db/queries';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Stable posting date — the day the careers page shipped. Never derive from
// "now": JobPosting.datePosted must not shift on every rebuild.
const DATE_POSTED = '2026-07-09';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.careers' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/careers/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/careers/`,
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

  const [nav, t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'careers' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: t('breadcrumb'), url: `/${locale}/careers/` },
  ];

  const jobDescription = [
    t('hero.subtitle'),
    t('duties.title') + ': ' + ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map((k) => t(`duties.items.${k}`)).join('; '),
    t('requirements.title') + ': ' + ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].map((k) => t(`requirements.items.${k}`)).join('; '),
  ].join(' ');

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <JobPostingSchema
        company={company}
        locale={locale}
        title={t('role.title')}
        description={jobDescription}
        datePosted={DATE_POSTED}
      />
      <CareersPage
        locale={locale as Locale}
        phone={company.phone || '778-960-7999'}
        email={company.email || 'info@reno-stars.com'}
      />
    </>
  );
}
