import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery, uncachedQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryPerSlug } from '../cache';
import {
  projectSites as sitesTable,
  siteImagePairs as siteImagePairsTable,
  siteExternalProducts as siteExternalProductsTable,
  projects as projectsTable,
} from '../schema';
import { groupBy, sortByDisplayOrder } from '../map-helpers';
import {
  DbProjectRow,
  DbSiteRow,
  DbSiteImagePairRow,
  DbSiteExternalProductRow,
  mapDbProjectToProject,
  mapDbSiteToSite,
} from '../project-mappers';
import { mergeServiceScopes, collectAllImages, collectAllExternalProducts } from '../helpers';
import { getProjectsOfSite } from './projects';
import type { Project, SiteWithProjects } from '../../types';

/** Fetch a site by slug with its projects and aggregated data. */
export const getSiteBySlugFromDb = cachedQueryPerSlug(
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
  },
  'getSiteBySlugFromDb',
  // Narrow tag only — admin fires updateTag('site:${slug}') on edits.
  { revalidate: 86400, tagPrefix: 'site' }
);

/** Fetch all published sites that should show as projects, with projects and aggregated data. */
export const getSitesAsProjectsFromDb = cachedQuery(async (): Promise<SiteWithProjects[]> => {
  return safeQuery('getSitesAsProjectsFromDb', async () => {
  const rows = await db
    .select()
    .from(sitesTable)
    .where(and(eq(sitesTable.isPublished, true), eq(sitesTable.showAsProject, true)))
    .orderBy(desc(sitesTable.createdAt));

  const siteIds = rows.map((r: DbSiteRow) => r.id);
  if (siteIds.length === 0) return [];

  // LISTING-LITE shape: this query feeds `/projects/`, `/projects/budget/*`,
  // and category routing on `/projects/[slug]/`. None of those render
  // child-project image_pairs, scopes, or external products — they show
  // site-level cards. Skipping the per-project relation fetches drops the
  // serialized payload by ~60% (was 3.1 MB per locale on /projects/, well
  // over Semrush's 2 MB threshold). Detail pages call getSiteBySlugFromDb
  // separately and still get the full data.
  const [allSiteImagePairs, allProjects] = await Promise.all([
    db.select().from(siteImagePairsTable).where(inArray(siteImagePairsTable.siteId, siteIds)) as Promise<DbSiteImagePairRow[]>,
    db
      .select()
      .from(projectsTable)
      .where(and(inArray(projectsTable.siteId, siteIds), eq(projectsTable.isPublished, true)))
      .orderBy(asc(projectsTable.displayOrderInSite)) as Promise<DbProjectRow[]>,
  ]);

  const siteImagePairsBySite = groupBy(allSiteImagePairs, (ip: DbSiteImagePairRow) => ip.siteId);

  // Group projects by siteId; child projects are intentionally bare —
  // empty image_pairs/scopes/external_products. Listing only reads slug,
  // title, category, hero_image off each child for the "childAreas" badge.
  const projectsBySite = new Map<string, Project[]>();
  for (const row of allProjects) {
    const project = mapDbProjectToProject(row, [], [], []);
    const arr = projectsBySite.get(row.siteId) ?? [];
    arr.push(project);
    projectsBySite.set(row.siteId, arr);
  }

  // Build results. aggregated.allImages is computed off site-level pairs
  // only (child projects have empty image_pairs in this shape), and
  // aggregated.allExternalProducts is empty since neither side has them.
  const results: SiteWithProjects[] = [];
  for (const row of rows) {
    const rowImagePairs = siteImagePairsBySite.get(row.id) ?? [];
    const site = mapDbSiteToSite(row, rowImagePairs, []);
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
}, ['getSitesAsProjectsFromDb-v3'], { revalidate: 300, tags: ['sites:listing', 'projects:listing'] });

/** Fetch all published site slugs with dates (for sitemap). Uncached — see getProjectSlugsFromDb. */
export async function getSiteSlugsFromDb(): Promise<{ slug: string; updatedAt: Date | null; heroImageUrl: string | null }[]> {
  return uncachedQuery('getSiteSlugsFromDb', async () => {
    const rows = await db
      .select({ slug: sitesTable.slug, updatedAt: sitesTable.updatedAt, heroImageUrl: sitesTable.heroImageUrl })
      .from(sitesTable)
      .where(and(eq(sitesTable.isPublished, true), eq(sitesTable.showAsProject, true)));
    return rows;
  }, []);
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
