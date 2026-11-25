/**
 * Project category hubs (/projects/<category>/) with NO published project
 * (DI-16, 2026-11-24).
 *
 * A category page lists the published projects whose `service_type` equals
 * the category slug (ProjectCategoryPage). With none, it renders only "No
 * projects found" — yet cabinet, basement, poly-b-replacement and
 * accessible-bathroom were submitted at priority 0.9 in 14 locales each (56
 * URLs). So an empty category is:
 *   - left out of the sitemap's project-hubs section (lib/sitemap/sections.ts);
 *   - served with `robots: noindex, follow` (app/[locale]/projects/[slug]/page.tsx),
 *     keeping `follow` so links on the page still pass.
 * Both are decided from live rows on every request, so the moment a project in
 * that category is published the page is indexable and back in the sitemap —
 * no code change.
 *
 * ONE rule for both callers, so the sitemap and the page cannot disagree.
 *
 * Outage guard: both row readers return `[]` when the database query fails
 * (`uncachedQuery` / `withFallback`). Zero published projects SITE-WIDE is
 * therefore treated as "unknown", not as "every category is empty" — otherwise
 * one failed query would noindex every hub and drop them all from the sitemap.
 */

/**
 * Categories that currently have at least one published project, or `null`
 * when that cannot be told (no published project rows at all — see the outage
 * guard above). `serviceTypes` is the service_type of every published project.
 */
export function categoriesWithProjects(
  serviceTypes: Iterable<string | null | undefined>,
): ReadonlySet<string> | null {
  const set = new Set<string>();
  let rows = 0;
  for (const t of serviceTypes) {
    rows++;
    if (t) set.add(t);
  }
  return rows === 0 ? null : set;
}

/** True when the category hub has nothing to show and should not be indexed/submitted. */
export function isEmptyCategory(category: string, withProjects: ReadonlySet<string> | null): boolean {
  return withProjects !== null && !withProjects.has(category);
}

/** robots for an EMPTY category hub. Non-empty hubs set no robots (unchanged). */
export const EMPTY_CATEGORY_ROBOTS = { index: false, follow: true } as const;
