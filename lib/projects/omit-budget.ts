/**
 * Project-area price removal (Ryan 11-24): the public projects pages show no
 * prices, so `budget_range` must not reach the client either — it used to sit
 * in the RSC flight payload of every detail page (this project's AND the
 * related-project cards').
 *
 * Use ONLY in the /projects/ routes. The database column stays (it still feeds
 * the service × city pages), and the shared service-page components and
 * queries keep receiving it unchanged.
 */

/** A copy of `row` without `budget_range` (the key is removed, not set to undefined). */
export function omitBudget<T extends { budget_range?: string }>(row: T): T {
  if (!('budget_range' in row)) return row;
  const copy = { ...row };
  delete copy.budget_range;
  return copy;
}

/** `omitBudget` for a site and each of its child projects. */
export function omitSiteBudget<S extends { budget_range?: string; projects: { budget_range?: string }[] }>(site: S): S {
  return { ...omitBudget(site), projects: site.projects.map(omitBudget) };
}
