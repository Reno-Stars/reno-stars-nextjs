import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { eq, asc, desc, and, or, like, inArray, count, isNull, sql } from 'drizzle-orm';
import { db } from './index';

/**
 * Wrap a layout-level / high-traffic query in BOTH layers of caching:
 * - `unstable_cache` shares the result across all Lambda invocations
 *   within the revalidate window (deduplicates Neon hits across requests).
 * - `cache` (from react) dedupes within a single render tree (covers
 *   the case where the same function gets called from layout + page).
 *
 * Order matters: react `cache()` must be the OUTER wrapper so it sees
 * each render-pass invocation; `unstable_cache` is the INNER store
 * that persists across renders.
 *
 * Default revalidate is 1h (3600s) — appropriate for content like
 * services / areas / company info that changes via the admin a few
 * times a day. Admin server actions call `revalidatePath` which
 * invalidates the unstable_cache entries on the affected paths.
 */
function cachedQuery<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {},
): () => Promise<T> {
  const wrapped = unstable_cache(fn, keyParts, {
    revalidate: options.revalidate ?? 3600,
    tags: options.tags,
  });
  return cache(wrapped);
}
import { COMPANY_STATS, getYearsExperience } from '@/lib/company-config';
import {
  companyInfo,
  socialLinks as socialLinksTable,
  services as servicesTable,
  serviceTags as serviceTagsTable,
  serviceBenefits as serviceBenefitsTable,

  projectSites as sitesTable,
  siteImagePairs as siteImagePairsTable,
  siteExternalProducts as siteExternalProductsTable,
  projects as projectsTable,
  projectImagePairs as projectImagePairsTable,
  projectScopes as projectScopesTable,
  projectExternalProducts as projectExternalProductsTable,
  blogPosts as blogPostsTable,
  contactSubmissions as contactSubmissionsTable,
  serviceAreas as serviceAreasTable,
  designs as designsTable,
  trustBadges as trustBadgesTable,

  faqs as faqsTable,
  partners as partnersTable,
  socialMediaPosts as socialMediaPostsTable,
} from './schema';
import { getAssetUrl, getOptionalAssetUrl } from '../storage';
import { WHOLE_HOUSE_CATEGORY } from '../data/services';
import { buildLocalized, buildLocalizedOptional } from '../utils';

/**
 * For per-row arrays (tags, benefits, highlights), build a Localized<string[]>
 * by reading each row's localizations jsonb. Items without a translation in
 * the requested locale fall back to the EN value, so locale arrays are always
 * the same length as the source array.
 */
const ARRAY_LOCALE_SUFFIXES = [
  ['ZhHant', 'zh-Hant'],
  ['Ja', 'ja'],
  ['Ko', 'ko'],
  ['Es', 'es'],
  ['Pa', 'pa'],
  ['Tl', 'tl'],
  ['Fa', 'fa'],
  ['Vi', 'vi'],
  ['Ru', 'ru'],
  ['Ar', 'ar'],
  ['Hi', 'hi'],
  ['Fr', 'fr'],
] as const;

function buildLocalizedArray<R extends { localizations?: unknown }>(
  rows: R[],
  enField: keyof R,
  zhField: keyof R,
  jsonbBaseName: string,
): import('../types').Localized<string[]> {
  const result: import('../types').Localized<string[]> = {
    en: rows.map((r) => r[enField] as string),
    zh: rows.map((r) => r[zhField] as string),
  };
  for (const [suffix, key] of ARRAY_LOCALE_SUFFIXES) {
    const arr = rows.map((r) => {
      const loc = r.localizations as Record<string, unknown> | null | undefined;
      const v = loc?.[`${jsonbBaseName}${suffix}`];
      return typeof v === 'string' && v ? v : (r[enField] as string);
    });
    // Only include the locale if at least one translation exists (otherwise
    // pickLocale would already fall back to en — no need to duplicate).
    if (arr.some((v, i) => v !== rows[i][enField])) {
      result[key] = arr;
    }
  }
  return result;
}

/** Build a Localized<string[]> for a single row's newline-list field with
 *  per-locale variants in the row's localizations jsonb (e.g. highlightsJa).
 *  Used for service_areas.highlights where each row has its own list. */
function buildSingleRowLocalizedArray(
  row: { localizations?: unknown },
  enList: string[] | null | undefined,
  zhList: string[] | null | undefined,
  jsonbBaseName: string,
): import('../types').Localized<string[]> | undefined {
  if (!enList && !zhList) return undefined;
  const result: import('../types').Localized<string[]> = {
    en: enList ?? [],
    zh: zhList ?? [],
  };
  const loc = row.localizations as Record<string, unknown> | null | undefined;
  for (const [suffix, key] of ARRAY_LOCALE_SUFFIXES) {
    const raw = loc?.[`${jsonbBaseName}${suffix}`];
    if (typeof raw === 'string' && raw.trim()) {
      result[key] = parseNewlineList(raw) ?? [];
    } else if (Array.isArray(raw)) {
      result[key] = raw.filter((v): v is string => typeof v === 'string');
    }
  }
  return result;
}

import { mergeServiceScopes, collectAllImages, collectAllExternalProducts } from './helpers';
import type { Company, SocialLink, Service, Project, ServiceArea, BlogPost, BlogRelatedProject, DesignItem, Faq, Site, SiteWithProjects, ImagePair, Partner } from '../types';

// ============================================================================
// HELPERS
// ============================================================================

/** Helper to sort arrays by displayOrder field */
function sortByDisplayOrder<T extends { displayOrder: number }>(arr: T[]): T[] {
  return arr.slice().sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Helper to group array items by a key field into a Map */
export function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

// ============================================================================
// DB RESILIENCE HELPER
// ============================================================================

/**
 * Wrap a DB-bound query with a fallback so a transient infra failure (Neon
 * quota exhaustion, transport error, timeout) renders an empty/graceful
 * page instead of cascading a 500 across an entire ISR-backed route. This
 * matters most for listing pages whose 500s would waste Googlebot crawl
 * budget across hundreds of locale variants.
 */
async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[db:${label}] query failed, returning fallback:`, err);
    return fallback;
  }
}

const COMPANY_FALLBACK: Company = (() => {
  const { foundingYear, teamSize, projectsCompleted, liabilityCoverage } = COMPANY_STATS;
  return {
    name: 'Reno Stars', tagline: '', phone: '', email: '', address: '',
    logo: '', quoteUrl: '/contact/',
    yearsExperience: getYearsExperience(),
    foundingYear, teamSize, projectsCompleted, liabilityCoverage,
    heroVideoUrl: '', heroImageUrl: '',
    geo: { latitude: 0, longitude: 0 },
  };
})();

// ============================================================================
// COMPANY QUERIES
// ============================================================================

/**
 * Fetch company info from DB and map to the `Company` type.
 * Stats (yearsExperience, teamSize, warranty, liabilityCoverage) come from
 * `lib/company-config.ts`, not the database.
 */
export const getCompanyFromDb = cachedQuery(async (): Promise<Company> => {
  return safeQuery('getCompanyFromDb', async () => {
    const rows = await db.select().from(companyInfo).limit(1);
    const row = rows[0];

    if (!row) return COMPANY_FALLBACK;

    return {
      name: row.name,
      tagline: row.tagline ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      address: row.address ?? '',
      logo: getAssetUrl(row.logoUrl ?? ''),
      quoteUrl: row.quoteUrl ?? '/contact/',
      yearsExperience: COMPANY_FALLBACK.yearsExperience,
      foundingYear: COMPANY_FALLBACK.foundingYear,
      teamSize: COMPANY_FALLBACK.teamSize,
      projectsCompleted: COMPANY_FALLBACK.projectsCompleted,
      liabilityCoverage: COMPANY_FALLBACK.liabilityCoverage,
      heroVideoUrl: row.heroVideoUrl ? getAssetUrl(row.heroVideoUrl) : '',
      heroImageUrl: row.heroImageUrl ? getAssetUrl(row.heroImageUrl) : '',
      geo: {
        latitude: parseFloat(row.geoLatitude ?? '') || 0,
        longitude: parseFloat(row.geoLongitude ?? '') || 0,
      },
    };
  }, COMPANY_FALLBACK);
}, ['getCompanyFromDb'], { tags: ['company'] });

/**
 * Fetch active social links ordered by display_order.
 */
export const getSocialLinksFromDb = cachedQuery(async (): Promise<SocialLink[]> => {
  return safeQuery('getSocialLinksFromDb', async () => {
    const rows = await db
      .select()
      .from(socialLinksTable)
      .where(eq(socialLinksTable.isActive, true))
      .orderBy(asc(socialLinksTable.displayOrder));

    return rows.map((row: typeof socialLinksTable.$inferSelect) => ({
      platform: row.platform as SocialLink['platform'],
      url: row.url,
      label: row.label ?? row.platform,
    }));
  }, []);
}, ['getSocialLinksFromDb'], { tags: ['social-links'] });

/**
 * Fetch services from DB, mapped to the `Service` type with bilingual content.
 */
export const getServicesFromDb = cachedQuery(async (): Promise<Service[]> => {
  return safeQuery('getServicesFromDb', async () => {
  const rows = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.displayOrder));

  // Batch-fetch all tags and benefits for all services
  const serviceIds = rows.map((r: typeof servicesTable.$inferSelect) => r.id);
  const [allTags, allBenefits] = serviceIds.length > 0
    ? await Promise.all([
        db.select().from(serviceTagsTable).where(inArray(serviceTagsTable.serviceId, serviceIds)),
        db.select().from(serviceBenefitsTable).where(inArray(serviceBenefitsTable.serviceId, serviceIds)),
      ])
    : [[], []];
  const tagsByService = groupBy(allTags, (t: typeof serviceTagsTable.$inferSelect) => t.serviceId);
  const benefitsByService = groupBy(allBenefits, (b: typeof serviceBenefitsTable.$inferSelect) => b.serviceId);

  return rows.map((row: typeof servicesTable.$inferSelect) => {
    const tags = sortByDisplayOrder(tagsByService.get(row.id) ?? []);
    const benefits = sortByDisplayOrder(benefitsByService.get(row.id) ?? []);
    return {
      slug: row.slug,
      title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations),
      description: buildLocalized('description', row.descriptionEn, row.descriptionZh, row.localizations),
      long_description: buildLocalizedOptional('longDescription', row.longDescriptionEn, row.longDescriptionZh, row.localizations),
      icon: getOptionalAssetUrl(row.iconUrl),
      image: getOptionalAssetUrl(row.imageUrl),
      tags: tags.length > 0
        ? buildLocalizedArray(tags, 'tagEn', 'tagZh', 'tag')
        : undefined,
      benefits: benefits.length > 0
        ? buildLocalizedArray(benefits, 'benefitEn', 'benefitZh', 'benefit')
        : undefined,
      showOnServicesPage: row.showOnServicesPage,
      isProjectType: row.isProjectType,
    };
  });
  }, []);
}, ['getServicesFromDb'], { tags: ['services'] });

/**
 * Fetch a slug → { en, zh } title map from the services table.
 * Used as the dynamic replacement for the old hardcoded serviceTypeToCategory.
 */
export const getServiceTypeMap = cache(async (): Promise<Record<string, import('../types').Localized<string>>> => {
  const services = await getServicesFromDb();
  const map: Record<string, import('../types').Localized<string>> = {};
  for (const s of services) {
    if (s.isProjectType === false) continue;
    // Carry full Localized shape (en, zh, ja, ko, es) so /xx/projects/ filter
    // cards and category labels render in the user's language. Was {en, zh} only.
    map[s.slug] = s.title;
  }
  return map;
});

/**
 * Get the service type → category name mapping from the DB.
 * Replaces the old hardcoded `serviceTypeToCategory`.
 * Includes 'whole-house' for Sites displayed as projects.
 */
export const getServiceTypeToCategory = cache(async (): Promise<Record<string, import('../types').Localized<string>>> => {
  const map = { ...await getServiceTypeMap() };
  // Ensure whole-house is always present (for Sites displayed as projects)
  if (!map['whole-house']) {
    map['whole-house'] = WHOLE_HOUSE_CATEGORY;
  }
  return map;
});

/**
 * Get localized category list for project filtering.
 * Includes "All" and "Whole House" (for Sites), plus all service types from DB.
 * Each category includes a `serviceType` matching the service_type field on projects.
 */
export const getCategoriesLocalized = cache(async (): Promise<({ serviceType: string } & import('../types').Localized<string>)[]> => {
  const serviceTypeToCategory = await getServiceTypeToCategory();
  const otherCategories = Object.entries(serviceTypeToCategory)
    .filter(([key]) => key !== 'whole-house')
    .map(([key, value]) => ({ serviceType: key, ...value }));

  return [
    { serviceType: 'All', en: 'All', zh: '全部', ja: 'すべて', ko: '전체', es: 'Todos' },
    { serviceType: 'whole-house', ...WHOLE_HOUSE_CATEGORY },
    ...otherCategories,
  ];
});

/**
 * Get category slugs for routing (excludes "All").
 */
export const getCategorySlugs = cache(async (): Promise<string[]> => {
  const categories = await getCategoriesLocalized();
  return categories
    .filter((c) => c.serviceType !== 'All')
    .map((c) => c.serviceType);
});



// ============================================================================
// PROJECT QUERIES
// ============================================================================

type DbProjectRow = typeof projectsTable.$inferSelect;
type DbImagePairRow = typeof projectImagePairsTable.$inferSelect;
type DbScopeRow = typeof projectScopesTable.$inferSelect;
type DbExternalProductRow = typeof projectExternalProductsTable.$inferSelect;
type DbSiteImagePairRow = typeof siteImagePairsTable.$inferSelect;

/** Generic interface for image pair DB rows (works for both project and site image pairs) */
interface DbImagePairBase {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  beforeVideoUrl: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  afterVideoUrl: string | null;
  titleEn: string | null;
  titleZh: string | null;
  captionEn: string | null;
  captionZh: string | null;
  photographerCredit: string | null;
  keywords: string | null;
}

/** Convert a DB image pair row to the ImagePair type (generic for project/site) */
function mapDbImagePairRowToImagePair(row: DbImagePairBase): ImagePair {
  const pair: ImagePair = {};

  if (row.beforeImageUrl) {
    pair.beforeImage = {
      src: getAssetUrl(row.beforeImageUrl),
      alt: {
        en: row.beforeAltTextEn ?? '',
        zh: row.beforeAltTextZh ?? '',
      },
    };
  }

  if (row.afterImageUrl) {
    pair.afterImage = {
      src: getAssetUrl(row.afterImageUrl),
      alt: {
        en: row.afterAltTextEn ?? '',
        zh: row.afterAltTextZh ?? '',
      },
    };
  }

  if (row.beforeVideoUrl) {
    pair.beforeVideo = getAssetUrl(row.beforeVideoUrl);
  }

  if (row.afterVideoUrl) {
    pair.afterVideo = getAssetUrl(row.afterVideoUrl);
  }

  if (row.titleEn || row.titleZh) {
    pair.title = { en: row.titleEn ?? '', zh: row.titleZh ?? '' };
  }

  if (row.captionEn || row.captionZh) {
    pair.caption = { en: row.captionEn ?? '', zh: row.captionZh ?? '' };
  }

  if (row.photographerCredit) {
    pair.photographerCredit = row.photographerCredit;
  }

  if (row.keywords) {
    pair.keywords = row.keywords;
  }

  return pair;
}

function mapDbProjectToProject(
  row: DbProjectRow,
  scopes: DbScopeRow[],
  externalProducts: DbExternalProductRow[] = [],
  imagePairs: DbImagePairRow[] = []
): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations),
    description: buildLocalized('description', row.descriptionEn, row.descriptionZh, row.localizations),
    project_story: buildLocalizedOptional('projectStory', row.projectStoryEn, row.projectStoryZh, row.localizations),
    excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations),
    service_type: row.serviceType ?? undefined,
    category: buildLocalized('category', row.categoryEn ?? '', row.categoryZh ?? '', row.localizations),
    location_city: row.locationCity ?? '',
    budget_range: row.budgetRange ?? undefined,
    duration: buildLocalizedOptional('duration', row.durationEn, row.durationZh, row.localizations),
    space_type: (row.spaceTypeEn || row.spaceTypeZh)
      ? buildLocalized('spaceType', row.spaceTypeEn ?? '', row.spaceTypeZh ?? '', row.localizations)
      : undefined,
    hero_image: getAssetUrl(row.heroImageUrl ?? ''),
    hero_video: getOptionalAssetUrl(row.heroVideoUrl),
    images: [], // Legacy field - kept for type compatibility (removal planned for v2.0)
    image_pairs: sortByDisplayOrder(imagePairs).map(mapDbImagePairRowToImagePair),
    service_scope:
      scopes.length > 0
        ? buildLocalizedArray(sortByDisplayOrder(scopes), 'scopeEn', 'scopeZh', 'scope')
        : undefined,
    challenge: buildLocalizedOptional('challenge', row.challengeEn, row.challengeZh, row.localizations),
    solution: buildLocalizedOptional('solution', row.solutionEn, row.solutionZh, row.localizations),
    published_at: row.publishedAt ?? undefined,
    featured: row.featured,
    badge: buildLocalizedOptional('badge', row.badgeEn, row.badgeZh, row.localizations),
    external_products:
      externalProducts.length > 0
        ? sortByDisplayOrder(externalProducts).map((ep) => ({
            url: ep.url,
            image_url: ep.imageUrl ? getAssetUrl(ep.imageUrl) : undefined,
            label: { en: ep.labelEn, zh: ep.labelZh },
          }))
        : undefined,
    // SEO fields
    meta_title:
      row.metaTitleEn || row.metaTitleZh
        ? { en: row.metaTitleEn ?? '', zh: row.metaTitleZh ?? '' }
        : undefined,
    meta_description:
      row.metaDescriptionEn || row.metaDescriptionZh
        ? { en: row.metaDescriptionEn ?? '', zh: row.metaDescriptionZh ?? '' }
        : undefined,
    focus_keyword:
      row.focusKeywordEn || row.focusKeywordZh
        ? { en: row.focusKeywordEn ?? '', zh: row.focusKeywordZh ?? '' }
        : undefined,
    seo_keywords:
      row.seoKeywordsEn || row.seoKeywordsZh
        ? { en: row.seoKeywordsEn ?? '', zh: row.seoKeywordsZh ?? '' }
        : undefined,
    po_number: row.poNumber ?? undefined,
    // Site relationship (mandatory)
    site_id: row.siteId,
    display_order_in_site: row.displayOrderInSite,
  };
}

async function fetchProjectRelations(projectIds: string[]): Promise<{
  imagePairs: DbImagePairRow[];
  scopes: DbScopeRow[];
  externalProducts: DbExternalProductRow[];
}> {
  if (projectIds.length === 0) return { imagePairs: [], scopes: [], externalProducts: [] };
  const [imagePairs, scopes, externalProducts] = await Promise.all([
    db.select().from(projectImagePairsTable).where(inArray(projectImagePairsTable.projectId, projectIds)) as Promise<DbImagePairRow[]>,
    db.select().from(projectScopesTable).where(inArray(projectScopesTable.projectId, projectIds)) as Promise<DbScopeRow[]>,
    db.select().from(projectExternalProductsTable).where(inArray(projectExternalProductsTable.projectId, projectIds)) as Promise<DbExternalProductRow[]>,
  ]);
  return { imagePairs, scopes, externalProducts };
}

/** Fetch all published projects from DB, mapped to `Project[]`. */
export const getProjectsFromDb = cache(async (): Promise<Project[]> => {
  return safeQuery('getProjectsFromDb', async () => {
    const rows: DbProjectRow[] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.isPublished, true))
      .orderBy(desc(projectsTable.createdAt));

    const ids = rows.map((r: DbProjectRow) => r.id);
    const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

    // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
    const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
    const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
    const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

    return rows.map((row: DbProjectRow) =>
      mapDbProjectToProject(
        row,
        scopesByProject.get(row.id) ?? [],
        epByProject.get(row.id) ?? [],
        imagePairsByProject.get(row.id) ?? []
      )
    );
  }, []);
});

/**
 * Lightweight version of getProjectsFromDb for listing pages: skips the
 * image_pairs / scopes / external_products joins (243 + 321 + N rows on
 * the relations side) and strips heavy long-form keys from the
 * localizations jsonb (description / project_story / challenge / solution
 * / meta_description across 12 locales).
 *
 * Used on homepage gallery, /projects/ index, /projects/budget/[tier]/,
 * /before-after/ list — pages that only need title / hero / category /
 * slug / location / featured-flag. Detail pages (/projects/[slug]/) use
 * the full getProjectsFromDb / getProjectBySlugFromDb.
 *
 * Verified payload reduction: 890 KB → ~120 KB per call.
 */
const stripProjectListLocalizations = sql`
  COALESCE(${projectsTable.localizations}, '{}'::jsonb)
    - 'descriptionAr' - 'descriptionEs' - 'descriptionFa' - 'descriptionFr'
    - 'descriptionHi' - 'descriptionJa' - 'descriptionKo' - 'descriptionPa'
    - 'descriptionRu' - 'descriptionTl' - 'descriptionVi' - 'descriptionZhHant'
    - 'projectStoryAr' - 'projectStoryEs' - 'projectStoryFa' - 'projectStoryFr'
    - 'projectStoryHi' - 'projectStoryJa' - 'projectStoryKo' - 'projectStoryPa'
    - 'projectStoryRu' - 'projectStoryTl' - 'projectStoryVi' - 'projectStoryZhHant'
    - 'challengeAr' - 'challengeEs' - 'challengeFa' - 'challengeFr'
    - 'challengeHi' - 'challengeJa' - 'challengeKo' - 'challengePa'
    - 'challengeRu' - 'challengeTl' - 'challengeVi' - 'challengeZhHant'
    - 'solutionAr' - 'solutionEs' - 'solutionFa' - 'solutionFr'
    - 'solutionHi' - 'solutionJa' - 'solutionKo' - 'solutionPa'
    - 'solutionRu' - 'solutionTl' - 'solutionVi' - 'solutionZhHant'
    - 'metaDescriptionAr' - 'metaDescriptionEs' - 'metaDescriptionFa' - 'metaDescriptionFr'
    - 'metaDescriptionHi' - 'metaDescriptionJa' - 'metaDescriptionKo' - 'metaDescriptionPa'
    - 'metaDescriptionRu' - 'metaDescriptionTl' - 'metaDescriptionVi' - 'metaDescriptionZhHant'
    - 'seoKeywordsZhHant' - 'focusKeywordZhHant'
`;

export const getProjectsListFromDb = cachedQuery(async (): Promise<Project[]> => {
  return safeQuery('getProjectsListFromDb', async () => {
    const rows = await db
      .select({
        id: projectsTable.id,
        slug: projectsTable.slug,
        titleEn: projectsTable.titleEn,
        titleZh: projectsTable.titleZh,
        descriptionEn: projectsTable.descriptionEn,
        descriptionZh: projectsTable.descriptionZh,
        excerptEn: projectsTable.excerptEn,
        excerptZh: projectsTable.excerptZh,
        projectStoryEn: sql<string | null>`NULL`,
        projectStoryZh: sql<string | null>`NULL`,
        serviceId: projectsTable.serviceId,
        serviceType: projectsTable.serviceType,
        categoryEn: projectsTable.categoryEn,
        categoryZh: projectsTable.categoryZh,
        locationCity: projectsTable.locationCity,
        budgetRange: projectsTable.budgetRange,
        durationEn: projectsTable.durationEn,
        durationZh: projectsTable.durationZh,
        spaceTypeEn: projectsTable.spaceTypeEn,
        spaceTypeZh: projectsTable.spaceTypeZh,
        heroImageUrl: projectsTable.heroImageUrl,
        challengeEn: sql<string | null>`NULL`,
        challengeZh: sql<string | null>`NULL`,
        solutionEn: sql<string | null>`NULL`,
        solutionZh: sql<string | null>`NULL`,
        badgeEn: projectsTable.badgeEn,
        badgeZh: projectsTable.badgeZh,
        featured: projectsTable.featured,
        isPublished: projectsTable.isPublished,
        publishedAt: projectsTable.publishedAt,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        siteId: projectsTable.siteId,
        displayOrderInSite: projectsTable.displayOrderInSite,
        metaTitleEn: projectsTable.metaTitleEn,
        metaTitleZh: projectsTable.metaTitleZh,
        metaDescriptionEn: projectsTable.metaDescriptionEn,
        metaDescriptionZh: projectsTable.metaDescriptionZh,
        focusKeywordEn: projectsTable.focusKeywordEn,
        focusKeywordZh: projectsTable.focusKeywordZh,
        seoKeywordsEn: projectsTable.seoKeywordsEn,
        seoKeywordsZh: projectsTable.seoKeywordsZh,
        poNumber: projectsTable.poNumber,
        heroVideoUrl: projectsTable.heroVideoUrl,
        localizations: stripProjectListLocalizations.as('localizations'),
      })
      .from(projectsTable)
      .where(eq(projectsTable.isPublished, true))
      .orderBy(desc(projectsTable.createdAt));

    return rows.map((row: typeof rows[number]) => mapDbProjectToProject(row as DbProjectRow, [], [], []));
  }, []);
}, ['getProjectsListFromDb'], { tags: ['projects'] });

/** Fetch a single published project by slug from DB. */
export const getProjectBySlugFromDb = cache(
  async (slug: string): Promise<Project | null> => {
    return safeQuery('getProjectBySlugFromDb', async () => {
      const rows = await db
        .select()
        .from(projectsTable)
        .where(and(eq(projectsTable.slug, slug), eq(projectsTable.isPublished, true)))
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      const { imagePairs, scopes, externalProducts } = await fetchProjectRelations([row.id]);
      return mapDbProjectToProject(row, scopes, externalProducts, imagePairs);
    }, null);
  }
);

/** Fetch all projects including unpublished (for admin). */
export async function getAllProjectsAdmin() {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt));

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

  return rows.map((row: DbProjectRow) => ({
    ...row,
    imagePairs: sortByDisplayOrder(imagePairsByProject.get(row.id) ?? []),
    scopes: sortByDisplayOrder(scopesByProject.get(row.id) ?? []),
    externalProducts: sortByDisplayOrder(epByProject.get(row.id) ?? []),
  }));
}

/** Fetch all published project slugs with dates (for sitemap). */
export async function getProjectSlugsFromDb(): Promise<{ slug: string; updatedAt: Date | null; locationCity: string | null }[]> {
  return safeQuery('getProjectSlugsFromDb', async () => {
    const rows = await db
      .select({ slug: projectsTable.slug, updatedAt: projectsTable.updatedAt, locationCity: projectsTable.locationCity })
      .from(projectsTable)
      .where(eq(projectsTable.isPublished, true));
    return rows;
  }, []);
}

/** Fetch all published site slugs with dates (for sitemap). */
export async function getSiteSlugsFromDb(): Promise<{ slug: string; updatedAt: Date | null }[]> {
  return safeQuery('getSiteSlugsFromDb', async () => {
    const rows = await db
      .select({ slug: sitesTable.slug, updatedAt: sitesTable.updatedAt })
      .from(sitesTable)
      .where(and(eq(sitesTable.isPublished, true), eq(sitesTable.showAsProject, true)));
    return rows;
  }, []);
}

// ============================================================================
// SITE QUERIES
// ============================================================================

type DbSiteRow = typeof sitesTable.$inferSelect;
type DbSiteExternalProductRow = typeof siteExternalProductsTable.$inferSelect;

function mapDbSiteToSite(row: DbSiteRow, siteImagePairRows?: DbSiteImagePairRow[], siteExternalProductRows?: DbSiteExternalProductRow[]): Site {
  return {
    id: row.id,
    slug: row.slug,
    title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations),
    description: buildLocalized('description', row.descriptionEn, row.descriptionZh, row.localizations),
    location_city: row.locationCity ?? undefined,
    hero_image: getOptionalAssetUrl(row.heroImageUrl),
    hero_video: getOptionalAssetUrl(row.heroVideoUrl),
    badge: buildLocalizedOptional('badge', row.badgeEn, row.badgeZh, row.localizations),
    excerpt: (row.excerptEn || row.excerptZh)
      ? buildLocalized('excerpt', row.excerptEn ?? '', row.excerptZh ?? '', row.localizations)
      : undefined,
    meta_title: (row.metaTitleEn || row.metaTitleZh)
      ? buildLocalized('metaTitle', row.metaTitleEn ?? '', row.metaTitleZh ?? '', row.localizations)
      : undefined,
    meta_description: (row.metaDescriptionEn || row.metaDescriptionZh)
      ? buildLocalized('metaDescription', row.metaDescriptionEn ?? '', row.metaDescriptionZh ?? '', row.localizations)
      : undefined,
    focus_keyword: (row.focusKeywordEn || row.focusKeywordZh)
      ? buildLocalized('focusKeyword', row.focusKeywordEn ?? '', row.focusKeywordZh ?? '', row.localizations)
      : undefined,
    seo_keywords: (row.seoKeywordsEn || row.seoKeywordsZh)
      ? buildLocalized('seoKeywords', row.seoKeywordsEn ?? '', row.seoKeywordsZh ?? '', row.localizations)
      : undefined,
    budget_range: row.budgetRange ?? undefined,
    duration: (row.durationEn || row.durationZh)
      ? buildLocalized('duration', row.durationEn ?? '', row.durationZh ?? '', row.localizations)
      : undefined,
    space_type: (row.spaceTypeEn || row.spaceTypeZh)
      ? buildLocalized('spaceType', row.spaceTypeEn ?? '', row.spaceTypeZh ?? '', row.localizations)
      : undefined,
    po_number: row.poNumber ?? undefined,
    show_as_project: row.showAsProject,
    featured: row.featured,
    published_at: row.publishedAt ?? undefined,
    images: undefined, // Legacy field - kept for type compatibility, always empty
    image_pairs: siteImagePairRows && siteImagePairRows.length > 0
      ? sortByDisplayOrder(siteImagePairRows).map(mapDbImagePairRowToImagePair)
      : undefined,
    external_products: siteExternalProductRows && siteExternalProductRows.length > 0
      ? sortByDisplayOrder(siteExternalProductRows).map((ep) => ({
          url: ep.url,
          image_url: ep.imageUrl ?? undefined,
          label: { en: ep.labelEn, zh: ep.labelZh },
        }))
      : undefined,
  };
}

/** Fetch projects for a given site ID. */
export const getProjectsOfSite = cache(async (siteId: string): Promise<Project[]> => {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.siteId, siteId), eq(projectsTable.isPublished, true)))
    .orderBy(asc(projectsTable.displayOrderInSite));

  if (rows.length === 0) return [];

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

  return rows.map((row: DbProjectRow) =>
    mapDbProjectToProject(
      row,
      scopesByProject.get(row.id) ?? [],
      epByProject.get(row.id) ?? [],
      imagePairsByProject.get(row.id) ?? []
    )
  );
});

/** Fetch a site by slug with its projects and aggregated data. */
export const getSiteBySlugFromDb = cache(
  async (slug: string): Promise<SiteWithProjects | null> => {
    return safeQuery('getSiteBySlugFromDb', async () => {
      const rows = await db
        .select()
        .from(sitesTable)
        .where(and(eq(sitesTable.slug, slug), eq(sitesTable.isPublished, true)))
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      // Fetch site image pairs, external products, and projects in parallel
      const [siteImagePairRows, siteEpRows, projects] = await Promise.all([
        db.select().from(siteImagePairsTable).where(eq(siteImagePairsTable.siteId, row.id)) as Promise<DbSiteImagePairRow[]>,
        db.select().from(siteExternalProductsTable).where(eq(siteExternalProductsTable.siteId, row.id)) as Promise<DbSiteExternalProductRow[]>,
        getProjectsOfSite(row.id),
      ]);

      const site = mapDbSiteToSite(row, siteImagePairRows, siteEpRows);

      // Build aggregated data (budget/duration come from site itself, not summed from projects)
      const aggregated: SiteWithProjects['aggregated'] = {
        allServiceScopes: mergeServiceScopes(projects),
        allImages: collectAllImages(projects, site),
        allExternalProducts: collectAllExternalProducts(projects, site),
      };

      return {
        ...site,
        projects,
        aggregated,
      };
    }, null);
  }
);

/** Fetch all published sites that should show as projects, with projects and aggregated data. */
export const getSitesAsProjectsFromDb = cache(async (): Promise<SiteWithProjects[]> => {
  return safeQuery('getSitesAsProjectsFromDb', async () => {
  const rows = await db
    .select()
    .from(sitesTable)
    .where(and(eq(sitesTable.isPublished, true), eq(sitesTable.showAsProject, true)))
    .orderBy(desc(sitesTable.createdAt));

  const siteIds = rows.map((r: DbSiteRow) => r.id);
  if (siteIds.length === 0) return [];

  // Fetch all site image pairs, site external products, and all projects for these sites in parallel (avoids N+1)
  const [allSiteImagePairs, allSiteExternalProducts, allProjects] = await Promise.all([
    db.select().from(siteImagePairsTable).where(inArray(siteImagePairsTable.siteId, siteIds)) as Promise<DbSiteImagePairRow[]>,
    db.select().from(siteExternalProductsTable).where(inArray(siteExternalProductsTable.siteId, siteIds)) as Promise<DbSiteExternalProductRow[]>,
    db
      .select()
      .from(projectsTable)
      .where(and(inArray(projectsTable.siteId, siteIds), eq(projectsTable.isPublished, true)))
      .orderBy(asc(projectsTable.displayOrderInSite)) as Promise<DbProjectRow[]>,
  ]);

  // Fetch relations for all projects in one batch
  const projectIds = allProjects.map((p: DbProjectRow) => p.id);
  const { imagePairs: allProjectImagePairs, scopes: allScopes, externalProducts: allExternalProducts } = await fetchProjectRelations(projectIds);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(allProjectImagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(allScopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(allExternalProducts, (ep: DbExternalProductRow) => ep.projectId);
  const siteImagePairsBySite = groupBy(allSiteImagePairs, (ip: DbSiteImagePairRow) => ip.siteId);
  const siteEpBySite = groupBy(allSiteExternalProducts, (ep: DbSiteExternalProductRow) => ep.siteId);

  // Group projects by siteId for efficient lookup
  const projectsBySite = new Map<string, Project[]>();
  for (const row of allProjects) {
    const project = mapDbProjectToProject(
      row,
      scopesByProject.get(row.id) ?? [],
      epByProject.get(row.id) ?? [],
      imagePairsByProject.get(row.id) ?? []
    );
    const arr = projectsBySite.get(row.siteId) ?? [];
    arr.push(project);
    projectsBySite.set(row.siteId, arr);
  }

  // Build results
  const results: SiteWithProjects[] = [];
  for (const row of rows) {
    const rowImagePairs = siteImagePairsBySite.get(row.id) ?? [];
    const rowEps = siteEpBySite.get(row.id) ?? [];
    const site = mapDbSiteToSite(row, rowImagePairs, rowEps);
    const projects = projectsBySite.get(row.id) ?? [];

    const aggregated: SiteWithProjects['aggregated'] = {
      allServiceScopes: mergeServiceScopes(projects),
      allImages: collectAllImages(projects, site),
      allExternalProducts: collectAllExternalProducts(projects, site),
    };

    results.push({
      ...site,
      project_count: projects.length,
      projects,
      aggregated,
    });
  }

  return results;
  }, []);
});

// ============================================================================
// SERVICE AREA QUERIES
// ============================================================================

/** Parse newline-separated text into a string array, filtering empty lines. */
function parseNewlineList(text: string | null): string[] | undefined {
  if (!text) return undefined;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

/** Fetch active service areas ordered by display_order. */
export const getServiceAreasFromDb = cachedQuery(async (): Promise<ServiceArea[]> => {
  return safeQuery('getServiceAreasFromDb', async () => {
    const rows = await db
      .select()
      .from(serviceAreasTable)
      .where(eq(serviceAreasTable.isActive, true))
      .orderBy(asc(serviceAreasTable.displayOrder));

    return rows.map((row: typeof serviceAreasTable.$inferSelect) => {
      const highlightsEn = parseNewlineList(row.highlightsEn);
      const highlightsZh = parseNewlineList(row.highlightsZh);

      return {
        id: row.id,
        slug: row.slug,
        name: buildLocalized('name', row.nameEn, row.nameZh, row.localizations),
        description: buildLocalizedOptional('description', row.descriptionEn, row.descriptionZh, row.localizations),
        content: buildLocalizedOptional('content', row.contentEn, row.contentZh, row.localizations),
        highlights: buildSingleRowLocalizedArray(row, highlightsEn, highlightsZh, 'highlights'),
        metaTitle: buildLocalizedOptional('metaTitle', row.metaTitleEn, row.metaTitleZh, row.localizations),
        metaDescription: buildLocalizedOptional('metaDescription', row.metaDescriptionEn, row.metaDescriptionZh, row.localizations),
      };
    });
  }, []);
}, ['getServiceAreasFromDb'], { tags: ['service-areas'] });

// ============================================================================
// BLOG POST QUERIES
// ============================================================================

/** Default number of blog posts per page */
export const BLOG_POSTS_PER_PAGE = 10;

/** Result of paginated blog posts query */
export interface PaginatedBlogPosts {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Strip content* keys from the localizations jsonb at the SQL layer for
 * listing queries. The columns content_en/content_zh aren't selected, but
 * the localizations jsonb embeds content for the other 12 locales — about
 * 6.5 MB of body text across 116 posts that listings never render.
 *
 * Verified 2026-05-04: full row payload 7.3 MB → 776 KB after strip
 * (9.4× reduction). Quota-eating culprit on Neon when layout + homepage
 * each call this on every Vercel ISR refresh / Lambda cold start.
 */
const stripBlogContentLocalizations = sql`
  COALESCE(${blogPostsTable.localizations}, '{}'::jsonb)
    - 'contentZhHant' - 'contentJa' - 'contentKo' - 'contentEs'
    - 'contentPa'    - 'contentTl' - 'contentFa' - 'contentVi'
    - 'contentRu'    - 'contentAr' - 'contentHi' - 'contentFr'
`;

/** Fetch all published blog posts ordered by publishedAt desc. */
export const getBlogPostsFromDb = cache(async (): Promise<BlogPost[]> => {
  return safeQuery('getBlogPostsFromDb', async () => {
    const rows = await db
      .select({
        slug: blogPostsTable.slug,
        titleEn: blogPostsTable.titleEn,
        titleZh: blogPostsTable.titleZh,
        excerptEn: blogPostsTable.excerptEn,
        excerptZh: blogPostsTable.excerptZh,
        featuredImageUrl: blogPostsTable.featuredImageUrl,
        publishedAt: blogPostsTable.publishedAt,
        updatedAt: blogPostsTable.updatedAt,
        localizations: stripBlogContentLocalizations.as('localizations'),
      })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true))
      .orderBy(desc(blogPostsTable.publishedAt));

    return rows.map((row: typeof rows[number]) => ({
      slug: row.slug,
      title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations as Record<string, unknown>),
      excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations as Record<string, unknown>),
      content: undefined,
      featured_image: getOptionalAssetUrl(row.featuredImageUrl),
      published_at: row.publishedAt ?? undefined,
      updated_at: row.updatedAt ?? undefined,
    }));
  }, []);
});

/** Fetch paginated published blog posts ordered by publishedAt desc. */
export const getBlogPostsPaginatedFromDb = cache(
  async (page: number = 1, perPage: number = BLOG_POSTS_PER_PAGE): Promise<PaginatedBlogPosts> => {
    return safeQuery('getBlogPostsPaginatedFromDb', async () => {
      // Get total count using SQL COUNT for efficiency
      const countResult = await db
        .select({ value: count() })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.isPublished, true));

      const totalCount = countResult[0]?.value ?? 0;
      const totalPages = Math.ceil(totalCount / perPage);
      const currentPage = Math.max(1, Math.min(page, totalPages || 1));
      const offset = (currentPage - 1) * perPage;

      // Slim projection — see getBlogPostsFromDb comment. Strips content*
      // keys from localizations jsonb at SQL layer (the 12 non-en/zh body
      // texts that listings never render).
      const rows = await db
        .select({
          slug: blogPostsTable.slug,
          titleEn: blogPostsTable.titleEn,
          titleZh: blogPostsTable.titleZh,
          excerptEn: blogPostsTable.excerptEn,
          excerptZh: blogPostsTable.excerptZh,
          featuredImageUrl: blogPostsTable.featuredImageUrl,
          publishedAt: blogPostsTable.publishedAt,
          updatedAt: blogPostsTable.updatedAt,
          localizations: stripBlogContentLocalizations.as('localizations'),
        })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.isPublished, true))
        .orderBy(desc(blogPostsTable.publishedAt))
        .limit(perPage)
        .offset(offset);

      const posts = rows.map((row: typeof rows[number]) => ({
        slug: row.slug,
        title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations as Record<string, unknown>),
        excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations as Record<string, unknown>),
        content: undefined,
        featured_image: getOptionalAssetUrl(row.featuredImageUrl),
        published_at: row.publishedAt ?? undefined,
        updated_at: row.updatedAt ?? undefined,
      }));

      return { posts, totalCount, totalPages, currentPage };
    }, { posts: [], totalCount: 0, totalPages: 0, currentPage: 1 });
  }
);

/** Fetch a single published blog post by slug, with related project if linked. */
export const getBlogPostBySlugFromDb = cache(
  async (slug: string): Promise<BlogPost | null> => {
    return safeQuery('getBlogPostBySlugFromDb', async () => {
    const rows = await db
      .select()
      .from(blogPostsTable)
      .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.isPublished, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    // Fetch related project and external products in parallel if projectId is set
    let relatedProject: BlogRelatedProject | undefined;
    if (row.projectId) {
      const [projectRows, externalProducts] = await Promise.all([
        db.select().from(projectsTable).where(eq(projectsTable.id, row.projectId)).limit(1),
        db.select().from(projectExternalProductsTable)
          .where(eq(projectExternalProductsTable.projectId, row.projectId))
          .orderBy(asc(projectExternalProductsTable.displayOrder)),
      ]);

      const project = projectRows[0];
      if (project) {
        relatedProject = {
          slug: project.slug,
          title: { en: project.titleEn, zh: project.titleZh },
          hero_image: project.heroImageUrl ? getAssetUrl(project.heroImageUrl) : undefined,
          external_products:
            externalProducts.length > 0
              ? externalProducts.map((ep: DbExternalProductRow) => ({
                  url: ep.url,
                  image_url: ep.imageUrl ? getAssetUrl(ep.imageUrl) : undefined,
                  label: { en: ep.labelEn, zh: ep.labelZh },
                }))
              : undefined,
        };
      }
    }

    return {
      slug: row.slug,
      title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations),
      excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations),
      content: buildLocalizedOptional('content', row.contentEn, row.contentZh, row.localizations),
      featured_image: getOptionalAssetUrl(row.featuredImageUrl),
      author: row.author ?? undefined,
      published_at: row.publishedAt ?? undefined,
      updated_at: row.updatedAt ?? undefined,
      meta_title: (row.metaTitleEn || row.metaTitleZh)
        ? buildLocalized('metaTitle', row.metaTitleEn ?? '', row.metaTitleZh ?? '', row.localizations)
        : undefined,
      meta_description: (row.metaDescriptionEn || row.metaDescriptionZh)
        ? buildLocalized('metaDescription', row.metaDescriptionEn ?? '', row.metaDescriptionZh ?? '', row.localizations)
        : undefined,
      focus_keyword: (row.focusKeywordEn || row.focusKeywordZh)
        ? buildLocalized('focusKeyword', row.focusKeywordEn ?? '', row.focusKeywordZh ?? '', row.localizations)
        : undefined,
      seo_keywords: (row.seoKeywordsEn || row.seoKeywordsZh)
        ? buildLocalized('seoKeywords', row.seoKeywordsEn ?? '', row.seoKeywordsZh ?? '', row.localizations)
        : undefined,
      related_project: relatedProject,
    };
    }, null);
  }
);

/** Fetch all published blog post slugs with dates (for sitemap). */
export async function getBlogPostSlugsFromDb(): Promise<{ slug: string; updatedAt: Date | null }[]> {
  return safeQuery('getBlogPostSlugsFromDb', async () => {
    const rows = await db
      .select({ slug: blogPostsTable.slug, updatedAt: blogPostsTable.updatedAt })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true));
    return rows;
  }, []);
}

// ============================================================================
// DESIGN QUERIES
// ============================================================================

/** Fetch published design items ordered by display_order. */
export const getDesignsFromDb = cache(async (): Promise<DesignItem[]> => {
  return safeQuery('getDesignsFromDb', async () => {
    const rows = await db
      .select()
      .from(designsTable)
      .where(eq(designsTable.isPublished, true))
      .orderBy(asc(designsTable.displayOrder));

    return rows.map((row: typeof designsTable.$inferSelect) => ({
      image: getAssetUrl(row.imageUrl),
      title: { en: row.titleEn ?? '', zh: row.titleZh ?? '' },
    }));
  }, []);
});

// ============================================================================
// TRUST BADGE QUERIES
// ============================================================================

/** Fetch active trust badges ordered by display_order. */
export const getTrustBadgesFromDb = cachedQuery(async (): Promise<import('../types').Localized<string>[]> => {
  return safeQuery('getTrustBadgesFromDb', async () => {
    const rows = await db
      .select()
      .from(trustBadgesTable)
      .where(eq(trustBadgesTable.isActive, true))
      .orderBy(asc(trustBadgesTable.displayOrder));

    return rows.map((row: typeof trustBadgesTable.$inferSelect) =>
      buildLocalized('badge', row.badgeEn, row.badgeZh, row.localizations)
    );
  }, []);
}, ['getTrustBadgesFromDb'], { tags: ['trust-badges'] });



// ============================================================================
// FAQ QUERIES
// ============================================================================

/** Map raw FAQ rows to Faq[], replacing {yearsExperience} placeholders. */
async function mapFaqRows(rows: (typeof faqsTable.$inferSelect)[]): Promise<Faq[]> {
  if (rows.length === 0) return [];
  const company = await getCompanyFromDb();
  const replaceYears = (text: string) =>
    text.replace(/\{yearsExperience\}/g, company.yearsExperience);
  return rows.map((row) => {
    const question = buildLocalized('question', row.questionEn, row.questionZh, row.localizations);
    const answerRaw = buildLocalized('answer', row.answerEn, row.answerZh, row.localizations);
    // Apply {yearsExperience} substitution across all locale variants
    const answer: import('../types').Localized<string> = {
      en: replaceYears(answerRaw.en),
    };
    if (answerRaw.zh !== undefined) answer.zh = replaceYears(answerRaw.zh);
    if (answerRaw.ja !== undefined) answer.ja = replaceYears(answerRaw.ja);
    if (answerRaw.ko !== undefined) answer.ko = replaceYears(answerRaw.ko);
    if (answerRaw.es !== undefined) answer.es = replaceYears(answerRaw.es);
    return {
      id: row.id,
      question,
      answer,
    };
  });
}

/** Fetch active global FAQs (no area scope) ordered by display_order. */
export const getFaqsFromDb = cache(async (): Promise<Faq[]> => {
  return safeQuery('getFaqsFromDb', async () => {
    const rows = await db
      .select()
      .from(faqsTable)
      .where(and(eq(faqsTable.isActive, true), isNull(faqsTable.serviceAreaId)))
      .orderBy(asc(faqsTable.displayOrder));
    return mapFaqRows(rows);
  }, []);
});

/** Fetch active FAQs for a specific service area, ordered by display_order. */
export const getFaqsByAreaFromDb = cache(async (areaId: string): Promise<Faq[]> => {
  return safeQuery('getFaqsByAreaFromDb', async () => {
    const rows = await db
      .select()
      .from(faqsTable)
      .where(and(eq(faqsTable.isActive, true), eq(faqsTable.serviceAreaId, areaId)))
      .orderBy(asc(faqsTable.displayOrder));
    return mapFaqRows(rows);
  }, []);
});

// ============================================================================
// AREA PROJECT QUERIES
// ============================================================================

/**
 * Fetch published projects where locationCity matches the given city name (case-insensitive).
 * Returns up to 6 Project[] for area pages. Queries the projects table directly so it captures
 * projects inside any site (including individual-projects with showAsProject=false).
 */
export const getProjectsByAreaFromDb = cache(async (cityName: string): Promise<Project[]> => {
  return safeQuery('getProjectsByAreaFromDb', async () => {
    const matchingRows: DbProjectRow[] = await db
      .select()
      .from(projectsTable)
      .where(and(
        eq(projectsTable.isPublished, true),
        sql`LOWER(${projectsTable.locationCity}) = LOWER(${cityName})`
      ))
      .orderBy(desc(projectsTable.createdAt))
      .limit(6);

    if (matchingRows.length === 0) return [];

    const ids = matchingRows.map((r: DbProjectRow) => r.id);
    const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

    const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
    const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
    const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

    return matchingRows.map((row: DbProjectRow) =>
      mapDbProjectToProject(
        row,
        scopesByProject.get(row.id) ?? [],
        epByProject.get(row.id) ?? [],
        imagePairsByProject.get(row.id) ?? []
      )
    );
  }, []);
});

// ============================================================================
// GUIDE PAGE QUERIES
// ============================================================================

/** Lightweight kitchen project data for the cost guide page. */
export interface KitchenGuideProject {
  /** Legacy flat fields kept for unchanged consumers — read .title/.duration/
   *  .spaceType (Localized<string>) when rendering across all 5 locales. */
  titleEn: string;
  titleZh: string;
  locationCity: string;
  budgetRange: string | null;
  durationEn: string | null;
  durationZh: string | null;
  spaceTypeEn: string | null;
  spaceTypeZh: string | null;
  slug: string;
  /** Localized<string> shapes built from row.localizations jsonb so guide pages
   *  on /ja/, /ko/, /es/ can render native titles via pickLocale. */
  title: import('../types').Localized<string>;
  duration?: import('../types').Localized<string>;
  spaceType?: import('../types').Localized<string>;
}

export const getKitchenProjectsForGuide = cache(async (): Promise<KitchenGuideProject[]> => {
  return safeQuery('getKitchenProjectsForGuide', async () => {
    const rows = await db
      .select({
        titleEn: projectsTable.titleEn,
        titleZh: projectsTable.titleZh,
        locationCity: projectsTable.locationCity,
        budgetRange: projectsTable.budgetRange,
        durationEn: projectsTable.durationEn,
        durationZh: projectsTable.durationZh,
        spaceTypeEn: projectsTable.spaceTypeEn,
        spaceTypeZh: projectsTable.spaceTypeZh,
        localizations: projectsTable.localizations,
        slug: projectsTable.slug,
      })
      .from(projectsTable)
      .where(and(
        eq(projectsTable.isPublished, true),
        eq(projectsTable.serviceType, 'kitchen')
      ))
      .orderBy(desc(projectsTable.createdAt));

    return rows.map((r: typeof rows[number]) => ({
      ...r,
      title: buildLocalized('title', r.titleEn, r.titleZh, r.localizations as Record<string, unknown> | null),
      duration: r.durationEn && r.durationZh
        ? buildLocalized('duration', r.durationEn, r.durationZh, r.localizations as Record<string, unknown> | null)
        : undefined,
      spaceType: r.spaceTypeEn && r.spaceTypeZh
        ? buildLocalized('spaceType', r.spaceTypeEn, r.spaceTypeZh, r.localizations as Record<string, unknown> | null)
        : undefined,
    }));
  }, []);
});


export const getBathroomProjectsForGuide = cache(async (): Promise<KitchenGuideProject[]> => {
  return safeQuery('getBathroomProjectsForGuide', async () => {
    const rows = await db
      .select({
        titleEn: projectsTable.titleEn,
        titleZh: projectsTable.titleZh,
        locationCity: projectsTable.locationCity,
        budgetRange: projectsTable.budgetRange,
        durationEn: projectsTable.durationEn,
        durationZh: projectsTable.durationZh,
        spaceTypeEn: projectsTable.spaceTypeEn,
        spaceTypeZh: projectsTable.spaceTypeZh,
        localizations: projectsTable.localizations,
        slug: projectsTable.slug,
      })
      .from(projectsTable)
      .where(and(
        eq(projectsTable.isPublished, true),
        eq(projectsTable.serviceType, 'bathroom')
      ))
      .orderBy(desc(projectsTable.createdAt));

    return rows.map((r: typeof rows[number]) => ({
      ...r,
      title: buildLocalized('title', r.titleEn, r.titleZh, r.localizations as Record<string, unknown> | null),
      duration: r.durationEn && r.durationZh
        ? buildLocalized('duration', r.durationEn, r.durationZh, r.localizations as Record<string, unknown> | null)
        : undefined,
      spaceType: r.spaceTypeEn && r.spaceTypeZh
        ? buildLocalized('spaceType', r.spaceTypeEn, r.spaceTypeZh, r.localizations as Record<string, unknown> | null)
        : undefined,
    }));
  }, []);
});


export const getWholeHouseProjectsForGuide = cache(async (): Promise<KitchenGuideProject[]> => {
  return safeQuery('getWholeHouseProjectsForGuide', async () => {
    const rows = await db
      .select({
        titleEn: projectsTable.titleEn,
        titleZh: projectsTable.titleZh,
        locationCity: projectsTable.locationCity,
        budgetRange: projectsTable.budgetRange,
        durationEn: projectsTable.durationEn,
        durationZh: projectsTable.durationZh,
        spaceTypeEn: projectsTable.spaceTypeEn,
        spaceTypeZh: projectsTable.spaceTypeZh,
        localizations: projectsTable.localizations,
        slug: projectsTable.slug,
      })
      .from(projectsTable)
      .where(and(
        eq(projectsTable.isPublished, true),
        eq(projectsTable.serviceType, 'whole-house')
      ))
      .orderBy(desc(projectsTable.createdAt));

    return rows.map((r: typeof rows[number]) => ({
      ...r,
      title: buildLocalized('title', r.titleEn, r.titleZh, r.localizations as Record<string, unknown> | null),
      duration: r.durationEn && r.durationZh
        ? buildLocalized('duration', r.durationEn, r.durationZh, r.localizations as Record<string, unknown> | null)
        : undefined,
      spaceType: r.spaceTypeEn && r.spaceTypeZh
        ? buildLocalized('spaceType', r.spaceTypeEn, r.spaceTypeZh, r.localizations as Record<string, unknown> | null)
        : undefined,
    }));
  }, []);
});

// ============================================================================
// ADMIN-ONLY QUERIES
// ============================================================================

/** Fetch all social links (admin — includes inactive). */
export async function getAllSocialLinksAdmin(): Promise<(typeof socialLinksTable.$inferSelect)[]> {
  return db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.displayOrder));
}

/** Fetch all services (admin — includes all fields + tags). */
export async function getAllServicesAdmin() {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
  const serviceIds = rows.map((r: typeof servicesTable.$inferSelect) => r.id);
  const allTags = serviceIds.length > 0
    ? await db.select().from(serviceTagsTable).where(inArray(serviceTagsTable.serviceId, serviceIds))
    : [];
  const tagsByService = groupBy(allTags, (t: typeof serviceTagsTable.$inferSelect) => t.serviceId);
  return rows.map((row: typeof servicesTable.$inferSelect) => ({
    ...row,
    tags: sortByDisplayOrder(tagsByService.get(row.id) ?? []),
  }));
}

/** Fetch all blog posts (admin — includes unpublished). */
export async function getAllBlogPostsAdmin() {
  return db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
}

/** Fetch all contact submissions (admin). */
export async function getAllContactsAdmin() {
  return db.select().from(contactSubmissionsTable).orderBy(desc(contactSubmissionsTable.createdAt));
}

/** Fetch all service areas (admin — includes inactive). */
export async function getAllServiceAreasAdmin(): Promise<(typeof serviceAreasTable.$inferSelect)[]> {
  return db.select().from(serviceAreasTable).orderBy(asc(serviceAreasTable.displayOrder));
}

/** Fetch all design items (admin — includes unpublished). */
export async function getAllDesignsAdmin(): Promise<(typeof designsTable.$inferSelect)[]> {
  return db.select().from(designsTable).orderBy(asc(designsTable.displayOrder));
}

/** Fetch all trust badges (admin — includes inactive). */
export async function getAllTrustBadgesAdmin(): Promise<(typeof trustBadgesTable.$inferSelect)[]> {
  return db.select().from(trustBadgesTable).orderBy(asc(trustBadgesTable.displayOrder));
}


/** Fetch all FAQs (admin — includes inactive). */
export async function getAllFaqsAdmin(): Promise<(typeof faqsTable.$inferSelect)[]> {
  return db.select().from(faqsTable).orderBy(asc(faqsTable.displayOrder));
}

/** Fetch all sites (admin — includes unpublished). */
export async function getAllSitesAdmin(): Promise<(typeof sitesTable.$inferSelect & { siteImagePairs: DbSiteImagePairRow[]; siteExternalProducts: DbSiteExternalProductRow[] })[]> {
  const rows: DbSiteRow[] = await db.select().from(sitesTable).orderBy(desc(sitesTable.createdAt));
  const siteIds = rows.map((r: DbSiteRow) => r.id);
  const [allImagePairs, allExternalProducts]: [DbSiteImagePairRow[], DbSiteExternalProductRow[]] = siteIds.length > 0
    ? await Promise.all([
        db.select().from(siteImagePairsTable).where(inArray(siteImagePairsTable.siteId, siteIds)),
        db.select().from(siteExternalProductsTable).where(inArray(siteExternalProductsTable.siteId, siteIds)),
      ])
    : [[], []];

  // Pre-group by siteId for O(1) lookup
  const imagePairsBySite = groupBy(allImagePairs, (ip: DbSiteImagePairRow) => ip.siteId);
  const epBySite = groupBy(allExternalProducts, (ep: DbSiteExternalProductRow) => ep.siteId);

  return rows.map((row: DbSiteRow) => ({
    ...row,
    siteImagePairs: sortByDisplayOrder(imagePairsBySite.get(row.id) ?? []),
    siteExternalProducts: sortByDisplayOrder(epBySite.get(row.id) ?? []),
  }));
}

/** Find or create the standalone projects container site. Returns its ID. */
export async function ensureStandaloneSite(): Promise<string> {
  const { STANDALONE_SITE_SLUG } = await import('@/lib/admin/constants');

  const [existing] = await db
    .select({ id: sitesTable.id })
    .from(sitesTable)
    .where(eq(sitesTable.slug, STANDALONE_SITE_SLUG))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(sitesTable)
    .values({
      slug: STANDALONE_SITE_SLUG,
      titleEn: 'Individual Projects',
      titleZh: '独立项目',
      descriptionEn: 'Container for standalone renovation projects.',
      descriptionZh: '独立装修项目的容器。',
      showAsProject: false,
      featured: false,
      isPublished: false,
    })
    .returning({ id: sitesTable.id });

  return created.id;
}

export interface ProjectSummary {
  id: string;
  slug: string;
  siteId: string;
  titleEn: string;
  titleZh: string;
  serviceType: string;
  isPublished: boolean;
  featured: boolean;
  displayOrderInSite: number;
  poNumber: string | null;
  createdAt: Date;
}

/** Fetch all projects grouped by siteId for the sites list (admin). Lightweight — no images/scopes. */
export async function getAllProjectsBySiteAdmin(): Promise<Record<string, ProjectSummary[]>> {
  const rows = await db
    .select({
      id: projectsTable.id,
      slug: projectsTable.slug,
      siteId: projectsTable.siteId,
      titleEn: projectsTable.titleEn,
      titleZh: projectsTable.titleZh,
      serviceType: projectsTable.serviceType,
      isPublished: projectsTable.isPublished,
      featured: projectsTable.featured,
      displayOrderInSite: projectsTable.displayOrderInSite,
      poNumber: projectsTable.poNumber,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .orderBy(asc(projectsTable.displayOrderInSite));

  const bySite = new Map<string, typeof rows>();
  for (const row of rows) {
    const arr = bySite.get(row.siteId) ?? [];
    arr.push(row);
    bySite.set(row.siteId, arr);
  }
  return Object.fromEntries(bySite);
}

/** Fetch all projects for a site with image pairs and scopes (admin). */
export async function getProjectsWithDetailsBySite(siteId: string) {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.siteId, siteId))
    .orderBy(asc(projectsTable.displayOrderInSite));

  if (rows.length === 0) return [];

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Build Maps for O(1) lookup per project
  const imagePairsByProject = new Map<string, DbImagePairRow[]>();
  for (const ip of imagePairs) {
    const arr = imagePairsByProject.get(ip.projectId) ?? [];
    arr.push(ip);
    imagePairsByProject.set(ip.projectId, arr);
  }
  const scopesByProject = new Map<string, DbScopeRow[]>();
  for (const s of scopes) {
    const arr = scopesByProject.get(s.projectId) ?? [];
    arr.push(s);
    scopesByProject.set(s.projectId, arr);
  }
  const epByProject = new Map<string, DbExternalProductRow[]>();
  for (const ep of externalProducts) {
    const arr = epByProject.get(ep.projectId) ?? [];
    arr.push(ep);
    epByProject.set(ep.projectId, arr);
  }

  return rows.map((row: DbProjectRow) => ({
    ...row,
    imagePairs: sortByDisplayOrder(imagePairsByProject.get(row.id) ?? []),
    scopes: sortByDisplayOrder(scopesByProject.get(row.id) ?? []),
    externalProducts: sortByDisplayOrder(epByProject.get(row.id) ?? []),
  }));
}

/** Get project by ID with image pairs and scopes (admin). */
export async function getProjectByIdAdmin(id: string) {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations([row.id]);

  return {
    ...row,
    imagePairs: sortByDisplayOrder(imagePairs),
    scopes: sortByDisplayOrder(scopes),
    externalProducts: sortByDisplayOrder(externalProducts),
  };
}

// ============================================================================
// PARTNER QUERIES
// ============================================================================

/** Fetch active partners ordered by display_order. */
export const getPartnersFromDb = cachedQuery(async (): Promise<Partner[]> => {
  return safeQuery('getPartnersFromDb', async () => {
    const rows = await db
      .select()
      .from(partnersTable)
      .where(eq(partnersTable.isActive, true))
      .orderBy(asc(partnersTable.displayOrder));

    return rows.map((row: typeof partnersTable.$inferSelect) => ({
      name: { en: row.nameEn, zh: row.nameZh },
      logo: getAssetUrl(row.logoUrl),
      url: row.websiteUrl ?? undefined,
      isHiddenVisually: row.isHiddenVisually,
    }));
  }, []);
}, ['getPartnersFromDb'], { tags: ['partners'] });

/** Fetch all partners (admin — includes inactive). */
export async function getAllPartnersAdmin(): Promise<(typeof partnersTable.$inferSelect)[]> {
  return db.select().from(partnersTable).orderBy(asc(partnersTable.displayOrder));
}


export const getCommercialProjectsForGuide = cache(async (): Promise<KitchenGuideProject[]> => {
  return safeQuery('getCommercialProjectsForGuide', async () => {
    const rows = await db
      .select({
        titleEn: projectsTable.titleEn,
        titleZh: projectsTable.titleZh,
        locationCity: projectsTable.locationCity,
        budgetRange: projectsTable.budgetRange,
        durationEn: projectsTable.durationEn,
        durationZh: projectsTable.durationZh,
        spaceTypeEn: projectsTable.spaceTypeEn,
        spaceTypeZh: projectsTable.spaceTypeZh,
        localizations: projectsTable.localizations,
        slug: projectsTable.slug,
      })
      .from(projectsTable)
      .where(and(
        eq(projectsTable.isPublished, true),
        eq(projectsTable.serviceType, 'commercial')
      ))
      .orderBy(desc(projectsTable.createdAt));

    return rows.map((r: typeof rows[number]) => ({
      ...r,
      title: buildLocalized('title', r.titleEn, r.titleZh, r.localizations as Record<string, unknown> | null),
      duration: r.durationEn && r.durationZh
        ? buildLocalized('duration', r.durationEn, r.durationZh, r.localizations as Record<string, unknown> | null)
        : undefined,
      spaceType: r.spaceTypeEn && r.spaceTypeZh
        ? buildLocalized('spaceType', r.spaceTypeEn, r.spaceTypeZh, r.localizations as Record<string, unknown> | null)
        : undefined,
    }));
  }, []);
});



export const getCabinetProjectsForGuide = cache(async (): Promise<KitchenGuideProject[]> => {
  return safeQuery('getCabinetProjectsForGuide', async () => {
    const rows = await db
      .select({
        titleEn: projectsTable.titleEn,
        titleZh: projectsTable.titleZh,
        locationCity: projectsTable.locationCity,
        budgetRange: projectsTable.budgetRange,
        durationEn: projectsTable.durationEn,
        durationZh: projectsTable.durationZh,
        spaceTypeEn: projectsTable.spaceTypeEn,
        spaceTypeZh: projectsTable.spaceTypeZh,
        localizations: projectsTable.localizations,
        slug: projectsTable.slug,
      })
      .from(projectsTable)
      .where(and(
        eq(projectsTable.isPublished, true),
        or(
          eq(projectsTable.serviceType, 'cabinet'),
          like(projectsTable.titleEn, '%Cabinet%')
        )
      ))
      .orderBy(desc(projectsTable.createdAt));

    return rows.map((r: typeof rows[number]) => ({
      ...r,
      title: buildLocalized('title', r.titleEn, r.titleZh, r.localizations as Record<string, unknown> | null),
      duration: r.durationEn && r.durationZh
        ? buildLocalized('duration', r.durationEn, r.durationZh, r.localizations as Record<string, unknown> | null)
        : undefined,
      spaceType: r.spaceTypeEn && r.spaceTypeZh
        ? buildLocalized('spaceType', r.spaceTypeEn, r.spaceTypeZh, r.localizations as Record<string, unknown> | null)
        : undefined,
    }));
  }, []);
});

// ============================================================================
// SOCIAL MEDIA POST QUERIES (ADMIN)
// ============================================================================

/** Fetch all social media posts (admin). */
export async function getAllSocialMediaPostsAdmin() {
  return db.select().from(socialMediaPostsTable).orderBy(desc(socialMediaPostsTable.createdAt));
}

/** Fetch a single social media post by ID (admin). */
export async function getSocialMediaPostByIdAdmin(id: string) {
  const rows = await db.select().from(socialMediaPostsTable).where(eq(socialMediaPostsTable.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Fetch source options (blog posts, projects, sites) for social post form dropdowns. */
export async function getSocialPostSourceOptions() {
  const [blogRows, projectRows, siteRows] = await Promise.all([
    db.select({ id: blogPostsTable.id, titleEn: blogPostsTable.titleEn, titleZh: blogPostsTable.titleZh })
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt)),
    db.select({ id: projectsTable.id, titleEn: projectsTable.titleEn, titleZh: projectsTable.titleZh })
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt)),
    db.select({ id: sitesTable.id, titleEn: sitesTable.titleEn, titleZh: sitesTable.titleZh })
      .from(sitesTable)
      .orderBy(desc(sitesTable.createdAt)),
  ]);
  return { blogRows, projectRows, siteRows };
}
