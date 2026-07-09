import { and, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryWithArgs } from '../cache';
import { projects as projectsTable } from '../schema';
import { groupBy } from '../map-helpers';
import {
  DbProjectRow,
  DbImagePairRow,
  DbScopeRow,
  DbExternalProductRow,
  mapDbProjectToProject,
  fetchProjectRelations,
} from '../project-mappers';
import { buildLocalized } from '../../utils';
import type { Project } from '../../types';

/**
 * Fetch published projects where locationCity matches the given city name (case-insensitive).
 * Returns up to 6 Project[] for area pages. Queries the projects table directly so it captures
 * projects inside any site (including individual-projects with showAsProject=false).
 */
export const getProjectsByAreaFromDb = cachedQueryWithArgs<string, Project[]>(async (cityName: string): Promise<Project[]> => {
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
}, ['getProjectsByAreaFromDb'], { tags: ['projects:by-area'] });

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
  title: import('../../types').Localized<string>;
  duration?: import('../../types').Localized<string>;
  spaceType?: import('../../types').Localized<string>;
}

export const getKitchenProjectsForGuide = cachedQuery(async (): Promise<KitchenGuideProject[]> => {
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
}, ['getKitchenProjectsForGuide'], { tags: ['projects:by-guide'] });


export const getBathroomProjectsForGuide = cachedQuery(async (): Promise<KitchenGuideProject[]> => {
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
}, ['getBathroomProjectsForGuide'], { tags: ['projects:by-guide'] });


export const getWholeHouseProjectsForGuide = cachedQuery(async (): Promise<KitchenGuideProject[]> => {
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
}, ['getWholeHouseProjectsForGuide'], { tags: ['projects:by-guide'] });


export const getCommercialProjectsForGuide = cachedQuery(async (): Promise<KitchenGuideProject[]> => {
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
}, ['getCommercialProjectsForGuide'], { tags: ['projects:by-guide'] });


export const getCabinetProjectsForGuide = cachedQuery(async (): Promise<KitchenGuideProject[]> => {
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
}, ['getCabinetProjectsForGuide'], { tags: ['projects:by-guide'] });
