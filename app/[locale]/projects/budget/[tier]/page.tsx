import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import ProjectsPage from '@/components/pages/ProjectsPage';
import { BreadcrumbSchema, ItemListSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getProjectsListFromDb, getSitesAsProjectsFromDb, getCategoriesLocalized } from '@/lib/db/queries';
import { NAVY, GOLD, GOLD_PALE, SURFACE_ALT, CARD, TEXT_MID } from '@/lib/theme';
import type { Project } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string; tier: string }>;
}


export const TIERS = ['under-30k', '30k-60k', '60k-plus'] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABELS: Record<Tier, { en: string; range: [number, number] }> = {
  'under-30k':  { en: 'Under $30K',     range: [0, 30000] },
  '30k-60k':    { en: '$30K – $60K',    range: [30000, 60000] },
  '60k-plus':   { en: '$60K & Over',    range: [60000, Number.POSITIVE_INFINITY] },
};

/**
 * Distinct, band-naming H1 per budget facet — resolves the "3 budget tiers
 * share one generic H1 (section.projectsH1)" duplication flagged by the
 * near-me/budget/homepage de-dup pass. Each string names the real price band
 * from TIER_LABELS[tier].range (no fabrication — $30K = the 30000 bound,
 * $60K = the 60000 bound). Localized for the build-time locales (en / zh /
 * zh-Hant); the other locales fall back to EN, mirroring the established
 * near-me `h1Override` convention (the localized band is also carried by the
 * fully-localized meta title/description). Exported for unit tests.
 */
const TIER_H1: Record<Tier, Partial<Record<Locale, string>> & { en: string }> = {
  'under-30k': {
    en: 'Under $30K Renovation Projects in Metro Vancouver',
    zh: '大温哥华 3 万加元以下装修项目',
    'zh-Hant': '大溫哥華 3 萬加元以下裝修項目',
  },
  '30k-60k': {
    en: '$30K–$60K Renovation Projects in Metro Vancouver',
    zh: '大温哥华 3 万–6 万加元装修项目',
    'zh-Hant': '大溫哥華 3 萬–6 萬加元裝修項目',
  },
  '60k-plus': {
    en: '$60K+ Renovation Projects in Metro Vancouver',
    zh: '大温哥华 6 万加元以上装修项目',
    'zh-Hant': '大溫哥華 6 萬加元以上裝修項目',
  },
};

/** Resolve the distinct band H1 for a tier + locale (EN fallback). */
export function budgetTierH1(tier: Tier, locale: string): string {
  const m = TIER_H1[tier];
  return m[locale as Locale] ?? m.en;
}

function parseBudgetMidpoint(range?: string): number | null {
  if (!range) return null;
  const nums = range.match(/[\d,]+/g);
  if (!nums || nums.length === 0) return null;
  const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10)).filter((n) => !Number.isNaN(n));
  if (parsed.length === 0) return null;
  if (parsed.length === 1) return parsed[0];
  return Math.round((parsed[0] + parsed[parsed.length - 1]) / 2);
}

function projectInTier(project: Project, tier: Tier): boolean {
  const mid = parseBudgetMidpoint(project.budget_range);
  if (mid === null) return false;
  const [lo, hi] = TIER_LABELS[tier].range;
  return mid >= lo && mid < hi;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tier } = await params;
  if (!TIERS.includes(tier as Tier)) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }
  const t = await getTranslations({ locale, namespace: 'metadata.projectsBudget' });
  const tierMeta = TIER_LABELS[tier as Tier];
  const baseUrl = getBaseUrl();
  const title = t('title', { tier: tierMeta.en });
  const description = t('description', { tier: tierMeta.en });
  const ogImage = buildOgImageUrl(title, description);

  return {
    title,
    description,
    alternates: buildAlternates(`/projects/budget/${tier}/`, locale),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/projects/budget/${tier}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, tier } = await params;
  if (!TIERS.includes(tier as Tier)) notFound();
  setRequestLocale(locale);

  const [nav, t, company, allProjects, sitesAsProjects, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'metadata.projectsBudget' }),
    getCompanyFromDb(),
    getProjectsListFromDb(),
    getSitesAsProjectsFromDb(),
    getCategoriesLocalized(),
  ]);

  const filteredProjects = allProjects.filter((p) => projectInTier(p, tier as Tier));
  const tierMeta = TIER_LABELS[tier as Tier];

  const breadcrumbs = [
    { name: nav('home'),     url: `/${locale}/` },
    { name: nav('projects'), url: `/${locale}/projects/` },
    { name: tierMeta.en,     url: `/${locale}/projects/budget/${tier}/` },
  ];

  const loc = locale as Locale;
  const itemListItems = filteredProjects.map((p) => ({
    name: pickLocale(p.title, loc),
    url: `/${locale}/projects/${p.slug}/`,
    image: p.hero_image,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      <ItemListSchema
        items={itemListItems}
        name={t('title', { tier: tierMeta.en })}
        description={t('description', { tier: tierMeta.en })}
      />
      {/* Distinct band header — each budget facet gets its own band-naming H1
          (resolves the shared generic-H1 duplication across the 3 tiers) plus
          faceted cross-links between the tiers. Rendered on the light
          SURFACE_ALT strip so it does not clash with the ProjectsPage navy hero
          that follows. The intro reuses the fully-localized, tier-specific meta
          description (real band numbers, no fabrication). */}
      <section className="px-4 py-10 sm:py-12" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
            {budgetTierH1(tier as Tier, locale)}
          </h1>
          <p className="text-base sm:text-lg mb-6 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
            {t('description', { tier: tierMeta.en })}
          </p>
          <nav aria-label={nav('projects')} className="flex flex-wrap justify-center gap-2">
            {TIERS.map((tv) => {
              const active = tv === (tier as Tier);
              return (
                <Link
                  key={tv}
                  href={`/${locale}/projects/budget/${tv}/`}
                  aria-current={active ? 'page' : undefined}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
                  style={
                    active
                      ? { backgroundColor: GOLD, color: '#fff' }
                      : { backgroundColor: CARD, color: NAVY, boxShadow: `inset 0 0 0 1px ${GOLD_PALE}` }
                  }
                >
                  {TIER_LABELS[tv].en}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>
      <ProjectsPage
        locale={loc}
        company={company}
        projects={filteredProjects}
        sitesAsProjects={sitesAsProjects}
        categories={categories}
      />
    </>
  );
}
