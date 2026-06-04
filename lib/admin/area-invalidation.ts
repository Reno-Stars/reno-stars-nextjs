/**
 * Cache-tag helpers for service-area + FAQ invalidation.
 *
 * Background: every `/[locale]/areas/[city]` page used to read the shared
 * `getServiceAreasFromDb` blob (tag `service-areas`) and `getFaqsByAreaFromDb`
 * (tag `faqs`), so ANY service-area or FAQ edit busted all ~180 area pages —
 * the dominant ISR-write source on that route (37x per-path churn). The fix
 * scopes the data reads per-city (`area:${slug}`) and per-area-FAQ
 * (`faqs:area:${areaId}`), and these helpers compute the narrow tag(s) each
 * admin action should bust. Sibling of `locale-invalidation.ts` (blog, #107).
 */

/** Narrow per-city tag for a service area's detail page. */
export function areaTag(slug: string): string {
  return `area:${slug}`;
}

/**
 * Tag for a FAQ based on its area assignment. A global FAQ (no service area)
 * shows on global surfaces (home page) and uses the broad `faqs` tag; an
 * area-scoped FAQ shows only on that city's page and uses a per-area tag, so
 * editing it busts just that one page.
 */
export function faqTag(serviceAreaId: string | null | undefined): string {
  return serviceAreaId ? `faqs:area:${serviceAreaId}` : 'faqs';
}

/**
 * Tags to bust when a FAQ is created/edited/moved. On an assignment change
 * (area A -> area B, or area -> global, or global -> area) BOTH endpoints must
 * refresh, so we return the deduped set of the previous and next tags. For a
 * create, pass the same id for both (one tag).
 */
export function faqAffectedTags(
  prevServiceAreaId: string | null | undefined,
  nextServiceAreaId: string | null | undefined,
): string[] {
  return [...new Set([faqTag(prevServiceAreaId), faqTag(nextServiceAreaId)])];
}

/**
 * Deduped tags for a batch of FAQs (a reorder touches many at once, possibly
 * spanning several areas and/or the global set).
 */
export function faqTagsForAreas(serviceAreaIds: ReadonlyArray<string | null | undefined>): string[] {
  return [...new Set(serviceAreaIds.map(faqTag))];
}
