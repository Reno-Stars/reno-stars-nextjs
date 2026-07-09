/**
 * Project & site row mappers shared by the projects, sites, guide-projects,
 * and blog (related-project) domain query modules. Extracted from queries.ts
 * (2026-07-09 split). Kept together because the site mappers reuse the project
 * image-pair mapper and both share the same DbImagePairBase shape.
 */
import { inArray, sql } from 'drizzle-orm';
import { db } from './index';
import {
  projectSites as sitesTable,
  siteImagePairs as siteImagePairsTable,
  siteExternalProducts as siteExternalProductsTable,
  projects as projectsTable,
  projectImagePairs as projectImagePairsTable,
  projectScopes as projectScopesTable,
  projectExternalProducts as projectExternalProductsTable,
} from './schema';
import { sortByDisplayOrder, buildLocalizedArray } from './map-helpers';
import { getAssetUrl, getOptionalAssetUrl } from '../storage';
import { buildLocalized, buildLocalizedOptional } from '../utils';
import type { Project, Site, ImagePair } from '../types';

export type DbProjectRow = typeof projectsTable.$inferSelect;
export type DbImagePairRow = typeof projectImagePairsTable.$inferSelect;
export type DbScopeRow = typeof projectScopesTable.$inferSelect;
export type DbExternalProductRow = typeof projectExternalProductsTable.$inferSelect;
export type DbSiteImagePairRow = typeof siteImagePairsTable.$inferSelect;

/** Generic interface for image pair DB rows (works for both project and site image pairs) */
export interface DbImagePairBase {
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
export function mapDbImagePairRowToImagePair(row: DbImagePairBase): ImagePair {
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

export function mapDbProjectToProject(
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
    hero_image_alt: (() => {
      const locs = row.localizations as Record<string, unknown> | null;
      const en = typeof locs?.['heroImageAltEn'] === 'string' ? locs['heroImageAltEn'] : '';
      const zh = typeof locs?.['heroImageAltZh'] === 'string' ? locs['heroImageAltZh'] : '';
      const zhHant = typeof locs?.['heroImageAltZhHant'] === 'string' ? locs['heroImageAltZhHant'] : '';
      if (!en && !zh && !zhHant) return undefined;
      return buildLocalized('heroImageAlt', en, zh, locs as Record<string, unknown> | null);
    })(),
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
    dynamic_blocks: Array.isArray(row.dynamicBlocks) ? (row.dynamicBlocks as Project['dynamic_blocks']) : undefined,
  };
}

export async function fetchProjectRelations(projectIds: string[]): Promise<{
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
export const stripProjectListLocalizations = sql`
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

export type DbSiteRow = typeof sitesTable.$inferSelect;
export type DbSiteExternalProductRow = typeof siteExternalProductsTable.$inferSelect;

export function mapDbSiteToSite(row: DbSiteRow, siteImagePairRows?: DbSiteImagePairRow[], siteExternalProductRows?: DbSiteExternalProductRow[]): Site {
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
          image_url: ep.imageUrl ? getAssetUrl(ep.imageUrl) : undefined,
          label: { en: ep.labelEn, zh: ep.labelZh },
        }))
      : undefined,
    dynamic_blocks: Array.isArray(row.dynamicBlocks) ? (row.dynamicBlocks as unknown[]) : undefined,
  };
}
