/**
 * Per-URL `<lastmod>` overrides for the service×city sitemap section.
 *
 * The section's default lastmod is `areaLastModMap.get(area.slug)` — the latest
 * project `updated_at` in that CITY — so every service and every locale for one
 * city shares a single timestamp (Surrey / West Vancouver / Langley all carry
 * 2026-06-02T07:37:24.452Z, Maple Ridge 2026-06-24T03:04:12.252Z). That value is
 * a project-catalogue stamp, not the date the page itself last changed.
 *
 * For the zh-Hant URLs below, GSC shows Google last crawled them 2026-07-11 to
 * 2026-08-01, BEFORE the pages actually changed, and the shared stamp predates
 * that crawl, so a sitemap resubmission could not prompt a recrawl. The override
 * carries the page's real last-modification date instead, keyed by the full
 * `<locale>/services/<service>/<city>` path so it touches exactly one URL each:
 * the en / zh siblings keep the shared value.
 *
 * 2026-09-24T23:23:15Z is when the release carrying the last change to these
 * pages went live (reno-stars-infra PR #309, `deploy(reno-stars-web):
 * 8014378d1e56`, merged 2026-09-24 23:23:15 UTC). The change set on this route
 * since the previous crawl: d7f43c3c (2026-08-26) removed `robots: noindex`
 * from zh-Hant service×city pages; fbeab999 (2026-09-24) rewrote the page's
 * JSON-LD; 96466104 (2026-09-24) changed `cta` strings the page renders;
 * 8014378d (2026-09-24) repaired zh-Hant FAQ wording (heat-pump-hvac q1). No
 * commit on main after that touches this route, and the per-city project
 * timestamps (the default source) are all earlier.
 *
 * Owner approval: Ryan, 2026-11-12 (via Captain). Scope: these 9 URLs only.
 * Remove an entry once its page genuinely changes again — the default source
 * will then be later than the override and should win.
 */
export const SERVICE_CITY_LASTMOD_OVERRIDES: Readonly<Record<string, string>> = {
  'zh-Hant/services/kitchen/surrey': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/bathroom/maple-ridge': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/cabinet/west-vancouver': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/cabinet/langley': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/commercial/surrey': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/basement/maple-ridge': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/heat-pump-hvac/surrey': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/critical-load-panel/west-vancouver': '2026-09-24T23:23:15.000Z',
  'zh-Hant/services/critical-load-panel/langley': '2026-09-24T23:23:15.000Z',
};

/** Override key for one service×city URL — mirrors the path the section emits. */
export function serviceCityLastModKey(locale: string, serviceSlug: string, areaSlug: string): string {
  return `${locale}/services/${serviceSlug}/${areaSlug}`;
}
