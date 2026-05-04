import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ProjectsPage from '@/components/pages/ProjectsPage';
import { BreadcrumbSchema, ItemListSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getProjectsListFromDb, getSitesAsProjectsFromDb, getCategoriesLocalized } from '@/lib/db/queries';
import type { Project } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string; tier: string }>;
}

export const revalidate = 2592000; // 30d — Vercel ISR write reduction

const TIERS = ['under-30k', '30k-60k', '60k-plus'] as const;
type Tier = (typeof TIERS)[number];

const TIER_LABELS: Record<Tier, { en: string; range: [number, number] }> = {
  'under-30k':  { en: 'Under $30K',     range: [0, 30000] },
  '30k-60k':    { en: '$30K – $60K',    range: [30000, 60000] },
  '60k-plus':   { en: '$60K & Over',    range: [60000, Number.POSITIVE_INFINITY] },
};

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

export function generateStaticParams() {
  const params: { locale: string; tier: string }[] = [];
  for (const locale of locales) {
    for (const tier of TIERS) {
      params.push({ locale, tier });
    }
  }
  return params;
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
      <BreadcrumbSchema items={breadcrumbs} />
      <ItemListSchema
        items={itemListItems}
        name={t('title', { tier: tierMeta.en })}
        description={t('description', { tier: tierMeta.en })}
      />
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
