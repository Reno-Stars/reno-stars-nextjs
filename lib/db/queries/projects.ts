import { cache } from 'react';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery, uncachedQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryPerSlug } from '../cache';
import { projects as projectsTable } from '../schema';
import { groupBy, sortByDisplayOrder } from '../map-helpers';
import {
  DbProjectRow,
  DbImagePairRow,
  DbScopeRow,
  DbExternalProductRow,
  mapDbProjectToProject,
  fetchProjectRelations,
  stripProjectListLocalizations,
} from '../project-mappers';
import type { Project } from '../../types';

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
}, ['getProjectsListFromDb-v2'], { revalidate: 300, tags: ['projects:listing'] });

/** Fetch a single published project by slug from DB. */
export const getProjectBySlugFromDb = cachedQueryPerSlug(
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
  },
  'getProjectBySlugFromDb',
  // Narrow tag only — admin actions fire updateTag('project:${slug}') to
  // invalidate just THIS detail page, not the other 50+ projects' caches.
  // List queries (getProjectsListFromDb) carry the broad 'projects' tag and
  // are still invalidated by the admin's broad updateTag('projects') call.
  { revalidate: 86400, tagPrefix: 'project' }
);

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
// UNCACHED (read fresh every call). The sitemap route (app/sitemap.ts) is
// force-dynamic and reads these, so uncached reads guarantee the sitemap always
// mirrors the DB — a freshly published slug appears immediately and a published
// slug can never silently drop out behind a stale cache. Do NOT wrap these in
// cachedQuery: a 300s-cached slug list was tried (2026-07-03) and a stale entry
// dropped a live blog from the sitemap after a restart. Sitemap traffic is
// crawler-only + low volume, so the per-request DB read is negligible.
export async function getProjectSlugsFromDb(): Promise<{ slug: string; updatedAt: Date | null; locationCity: string | null; heroImageUrl: string | null }[]> {
  return uncachedQuery('getProjectSlugsFromDb', async () => {
    const rows = await db
      .select({ slug: projectsTable.slug, updatedAt: projectsTable.updatedAt, locationCity: projectsTable.locationCity, heroImageUrl: projectsTable.heroImageUrl })
      .from(projectsTable)
      .where(eq(projectsTable.isPublished, true));
    return rows;
  }, []);
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
