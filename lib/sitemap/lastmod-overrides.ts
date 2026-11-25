/**
 * Per-URL `<lastmod>` overrides for the service×city sitemap section.
 *
 * (History: until 2026-11-24 the section's default lastmod was the latest
 * project `updated_at` in the CITY, shared by every service and locale for that
 * city. Since DI-12 #2 the default is the page's own inputs — see
 * `serviceCityLastMod` in data.ts — and test A is frozen below.)
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

/**
 * TEST A — FROZEN until the experiment is read out (DI-12 #2, 2026-11-24).
 * 「测试 A 冻结至读数后统一」
 *
 * The 14 service×city URLs of SEO test A (experiment + control pairs) keep the
 * exact <lastmod> they carried in the live sitemap on 2026-11-24 15:46 PT, so the
 * lastmod policy change cannot alter how Google recrawls the experiment's pages.
 * Values are copied verbatim from that snapshot
 * (dev_queue 113_spec/testA_lastmod_before.csv). They were derived from
 * project timestamps, so without this freeze they would keep moving.
 *
 * These win over every other source, including SERVICE_CITY_LASTMOD_OVERRIDES.
 * Remove the whole block in one change after test A is read out.
 */
export const TEST_A_FROZEN_LASTMOD: Readonly<Record<string, string>> = {
  'en/services/kitchen/richmond': '2026-11-16T19:54:08.573Z',
  'en/services/kitchen/delta': '2026-10-21T01:14:25.669Z',
  'en/services/kitchen/coquitlam': '2026-08-08T01:22:30.955Z',
  'en/services/kitchen/north-vancouver': '2026-08-08T01:22:30.955Z',
  'en/services/basement/north-vancouver': '2026-08-08T01:22:30.955Z',
  'en/services/basement/burnaby': '2026-10-21T19:41:54.209Z',
  'en/services/basement/langley': '2026-06-02T07:37:24.452Z',
  'en/services/basement/port-moody': '2026-11-16T20:49:55.487Z',
  'en/services/cabinet/delta': '2026-10-21T01:14:25.669Z',
  'en/services/cabinet/port-moody': '2026-11-16T20:49:55.487Z',
  'en/services/bathroom/port-coquitlam': '2026-11-16T20:49:55.487Z',
  'en/services/bathroom/white-rock': '2026-11-16T20:49:55.487Z',
  'en/services/heat-pump-hvac/port-moody': '2026-11-16T20:49:55.487Z',
  'en/services/critical-load-panel/langley': '2026-06-02T07:37:24.452Z',
};
