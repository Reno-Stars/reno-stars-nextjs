import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryPerSlug } from '../cache';
import {
  designs as designsTable,
  trustBadges as trustBadgesTable,
  faqs as faqsTable,
  partners as partnersTable,
  propertyTypes as propertyTypesTable,
} from '../schema';
import { getAssetUrl } from '../../storage';
import { buildLocalized } from '../../utils';
import { getCompanyFromDb } from './company';
import type { DesignItem, Faq, Partner } from '../../types';

// ============================================================================
// DESIGN QUERIES
// ============================================================================

/** Fetch published design items ordered by display_order. */
export const getDesignsFromDb = cachedQuery(async (): Promise<DesignItem[]> => {
  return safeQuery('getDesignsFromDb', async () => {
    const rows = await db
      .select()
      .from(designsTable)
      .where(eq(designsTable.isPublished, true))
      .orderBy(asc(designsTable.displayOrder));

    return rows.map((row: typeof designsTable.$inferSelect) => ({
      image: getAssetUrl(row.imageUrl),
      // buildLocalized surfaces the localizations JSONB (12 non-en/zh locales)
      // — the old `{ en, zh }` literal dropped every other locale's title.
      title: buildLocalized('title', row.titleEn ?? '', row.titleZh ?? '', row.localizations),
    }));
  }, []);
}, ['getDesignsFromDb'], { tags: ['designs'] });

/** Fetch all design items (admin — includes unpublished). */
export async function getAllDesignsAdmin(): Promise<(typeof designsTable.$inferSelect)[]> {
  return db.select().from(designsTable).orderBy(asc(designsTable.displayOrder));
}

// ============================================================================
// TRUST BADGE QUERIES
// ============================================================================

/** Fetch active trust badges ordered by display_order. */
export const getTrustBadgesFromDb = cachedQuery(async (): Promise<import('../../types').Localized<string>[]> => {
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

/** Fetch all trust badges (admin — includes inactive). */
export async function getAllTrustBadgesAdmin(): Promise<(typeof trustBadgesTable.$inferSelect)[]> {
  return db.select().from(trustBadgesTable).orderBy(asc(trustBadgesTable.displayOrder));
}

// ============================================================================
// FAQ QUERIES
// ============================================================================

/** Map raw FAQ rows to Faq[], replacing {yearsExperience} placeholders. */
export async function mapFaqRows(rows: (typeof faqsTable.$inferSelect)[]): Promise<Faq[]> {
  if (rows.length === 0) return [];
  const company = await getCompanyFromDb();
  const replaceYears = (text: string) =>
    text.replace(/\{yearsExperience\}/g, company.yearsExperience);
  return rows.map((row) => {
    const question = buildLocalized('question', row.questionEn, row.questionZh, row.localizations);
    const answerRaw = buildLocalized('answer', row.answerEn, row.answerZh, row.localizations);
    // Apply {yearsExperience} substitution across EVERY locale buildLocalized
    // returned — the old hand-listed en/zh/ja/ko/es dropped the other 9 locales'
    // answers (zh-Hant/pa/tl/fa/vi/ru/ar/hi/fr), rendering EN answers next to
    // translated questions on those pages.
    const answer = Object.fromEntries(
      Object.entries(answerRaw).map(([loc, txt]) => [loc, replaceYears(txt as string)]),
    ) as import('../../types').Localized<string>;
    return {
      id: row.id,
      question,
      answer,
    };
  });
}

/** Fetch active global FAQs (no area scope) ordered by display_order. */
export const getFaqsFromDb = cachedQuery(async (): Promise<Faq[]> => {
  return safeQuery('getFaqsFromDb', async () => {
    const rows = await db
      .select()
      .from(faqsTable)
      .where(and(eq(faqsTable.isActive, true), isNull(faqsTable.serviceAreaId)))
      .orderBy(asc(faqsTable.displayOrder));
    return mapFaqRows(rows);
  }, []);
}, ['getFaqsFromDb'], { tags: ['faqs'] });

/**
 * Fetch active FAQs for a specific service area, ordered by display_order.
 * Cached PER-AREA and tagged `faqs:area:${areaId}` (NOT the broad `faqs`),
 * so an edit to one area's FAQ — or to a global FAQ — busts only the pages
 * that actually show it, instead of every area page at once. The admin FAQ
 * actions bust the matching `faqs:area:${id}` / `faqs` tag (see
 * `lib/admin/area-invalidation.ts`).
 */
export const getFaqsByAreaFromDb = cachedQueryPerSlug<Faq[]>(async (areaId: string): Promise<Faq[]> => {
  return safeQuery('getFaqsByAreaFromDb', async () => {
    const rows = await db
      .select()
      .from(faqsTable)
      .where(and(eq(faqsTable.isActive, true), eq(faqsTable.serviceAreaId, areaId)))
      .orderBy(asc(faqsTable.displayOrder));
    return mapFaqRows(rows);
  }, []);
}, 'getFaqsByAreaFromDb', { tagPrefix: 'faqs:area' });

/** Fetch all FAQs (admin — includes inactive). */
export async function getAllFaqsAdmin(): Promise<(typeof faqsTable.$inferSelect)[]> {
  return db.select().from(faqsTable).orderBy(asc(faqsTable.displayOrder));
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
      name: buildLocalized('name', row.nameEn, row.nameZh, row.localizations),
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

// ============================================================================
// PROPERTY TYPE QUERIES
// ============================================================================

/** Bilingual property-type options for the contact form dropdown. */
export interface PropertyType {
  id: string;
  slug: string;
  name: { en: string; zh: string };
}

export const getPropertyTypesFromDb = cachedQuery(async (): Promise<PropertyType[]> => {
  return safeQuery('getPropertyTypesFromDb', async () => {
    const rows = await db
      .select()
      .from(propertyTypesTable)
      .where(eq(propertyTypesTable.isActive, true))
      .orderBy(asc(propertyTypesTable.displayOrder));

    return rows.map((row: typeof propertyTypesTable.$inferSelect) => ({
      id: row.id,
      slug: row.slug,
      name: { en: row.nameEn, zh: row.nameZh },
    }));
  }, []);
}, ['getPropertyTypesFromDb'], { tags: ['property-types'] });
