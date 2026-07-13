/**
 * Blog schema/date resolution — single source of truth for the dates a blog
 * post publishes to the outside world (BlogPosting JSON-LD, OpenGraph
 * article:published_time/modified_time, and the visible published/updated
 * labels on the post page).
 *
 * Why this exists (2026-07-10 bathtub-query forensics, first fix 2026-07-13):
 * the BlogPosting schema on an April-published post was observed emitting
 * `datePublished` from a *reset* published_at (an admin re-save had clobbered
 * it to "now") and `dateModified` straight from `updated_at` — a column that
 * bulk maintenance scripts (translation backfills, link rewrites, the daily
 * 6:17 AM SEO-builder cron) touch wholesale. At the time of the audit, 89 of
 * 250 blog rows shared one exact updated_at microsecond timestamp, 30 shared
 * another, and 238/250 rows had updated_at > published_at. Fake-fresh dates are
 * a trust signal Google explicitly devalues.
 *
 * WHY THE HEURISTIC WAS RETIRED (2026-07-13 review findings #8/#30/#23/#28):
 * the first fix inferred "genuine edit" from `updated_at` with a ±60-min
 * bulk-touch *cluster* heuristic (dateModified only when no other blog row was
 * written within an hour). That was a read-side forensic guess with two fatal
 * flaws:
 *   1. It suppressed GENUINE edits. An admin editing 2-3 posts in one session,
 *      or editing within an hour of the 6:17 AM SEO-builder cron, produced a
 *      cluster >= 2, so the dateModified, the visible "Updated" label, and the
 *      sitemap <lastmod> were ALL dropped — permanently, failing closed on real
 *      human edits.
 *   2. It was expensive: a per-slug second round-trip on the page path and an
 *      O(n^2) correlated count(*) on the force-dynamic /sitemap.xml.
 *
 * THE PROPER FIX — a write-side signal, `blog_posts.content_updated_at`:
 * the admin content-save path (updateBlogPost, app/actions/admin/blog.ts)
 * stamps `content_updated_at = now()` on every genuine content edit. Nothing
 * else writes it — bulk/translation/cron scripts leave it untouched, so it can
 * never be poisoned the way `updated_at` was. dateModified is then a plain,
 * honest column read:
 *
 *   - datePublished = published_at, falling back to created_at.
 *   - dateModified  = content_updated_at, emitted ONLY when it is meaningfully
 *     later than the publication date ({@link MIN_MODIFIED_GAP_MS} — the same
 *     24h window the visible "Updated" label always used, which also elides
 *     trivial same-day churn like a typo fix minutes after publishing). NULL
 *     content_updated_at (every row predating this column, and every post never
 *     edited since publication) → dateModified OMITTED. Omitting is honest;
 *     request-time or bulk-touch timestamps are not, and this module always
 *     prefers to fail CLOSED.
 *
 * Backfill note: existing rows were left NULL (dateModified omitted). This is a
 * zero-regression change — verified against prod 2026-07-13, the retired
 * cluster heuristic already emitted dateModified for 0 of 237 published rows
 * (all were in bulk-touch clusters), so no live page lost a real "Updated"
 * date. Going forward, the FIRST genuine admin edit of a post lights up its
 * dateModified.
 */

/** Minimum gap between the publication date and `content_updated_at` before the
 * edit counts as a meaningful, advertisable post-publication change (matches
 * the visible "Updated" label rule; elides trivial same-day churn). */
export const MIN_MODIFIED_GAP_MS = 24 * 60 * 60 * 1000;

export interface BlogDateSource {
  /** Publication date (may have been reset by past admin-save bugs). */
  published_at?: Date | string | null;
  /** Row creation date — the fallback publication signal. */
  created_at?: Date | string | null;
  /**
   * Last GENUINE admin content edit — written only by the admin content-save
   * path (updateBlogPost), never by bulk/translation/cron scripts. This is the
   * trusted `dateModified` source. NULL/absent → dateModified omitted.
   */
  content_updated_at?: Date | string | null;
}

export interface ResolvedBlogDates {
  /** ISO 8601 publication timestamp, or undefined when no valid source. */
  datePublished?: string;
  /**
   * ISO 8601 last-genuine-edit timestamp. Undefined whenever there is no
   * trustworthy post-publication edit signal — callers must OMIT the field,
   * not substitute.
   */
  dateModified?: string;
}

function toValidDate(value: Date | string | null | undefined): Date | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Resolve the publicly-emitted dates for a blog post. Pure — safe on both
 * server (JSON-LD/metadata) and client (visible labels). Tolerant of the
 * string dates unstable_cache hands back on a cache hit (Date columns
 * JSON-serialize to ISO strings) and of unparseable values. */
export function resolveBlogDates(source: BlogDateSource): ResolvedBlogDates {
  const published = toValidDate(source.published_at) ?? toValidDate(source.created_at);
  const contentUpdated = toValidDate(source.content_updated_at);

  const datePublished = published?.toISOString();

  const isGenuineEdit =
    contentUpdated !== undefined &&
    published !== undefined &&
    contentUpdated.getTime() > published.getTime() + MIN_MODIFIED_GAP_MS;

  return {
    ...(datePublished && { datePublished }),
    ...(isGenuineEdit && { dateModified: contentUpdated.toISOString() }),
  };
}
