import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import CareersPage, { DUTY_KEYS, REQ_KEYS } from '@/components/pages/CareersPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import JobPostingSchema from '@/components/structured-data/JobPostingSchema';
import { getCompanyFromDb } from '@/lib/db/queries';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Declared locally (not relying on layout inheritance) so JobPosting.validThrough
// — a rolling date computed at render — can never freeze at a build-time value if
// the layout's dynamic setting ever changes.
export const dynamic = 'force-dynamic';

// Stable posting date — the day the careers page shipped. Never derive from
// "now": JobPosting.datePosted must not shift on every rebuild.
const DATE_POSTED = '2026-07-09';
// Owner-provided base pay (2026-07-10): ~CAD 4,000/month. Must match role.pay
// on the visible page (Google flags schema/page salary mismatches).
const BASE_SALARY_MONTH_CAD = 4000;

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

  const [nav, t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'careers' }),
    getCompanyFromDb(),
  ]);

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: t('breadcrumb'), url: `/${locale}/careers/` },
  ];

  // Schema skills/qualifications come from the SAME localized duty/requirement
  // keys that render on the page — one source, so the JobPosting matches the
  // visible content in every locale (no half-EN structured data).
  const localizedDuties = DUTY_KEYS.map((k) => t(`duties.items.${k}`));
  const localizedReqs = REQ_KEYS.map((k) => t(`requirements.items.${k}`));
  const jobDescription = [
    t('hero.subtitle'),
    t('duties.title') + ': ' + localizedDuties.join('; '),
    t('requirements.title') + ': ' + localizedReqs.join('; '),
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
        baseSalaryMonthCad={BASE_SALARY_MONTH_CAD}
        skills={localizedDuties.join(', ')}
        qualifications={localizedReqs.join('; ')}
      />
      <CareersPage
        locale={locale as Locale}
        phone={company.phone || '778-960-7999'}
        email={company.email || 'info@reno-stars.com'}
      />
    </>
  );
}
