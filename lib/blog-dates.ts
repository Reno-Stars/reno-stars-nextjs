/**
 * Blog schema/date resolution — single source of truth for the dates a blog
 * post publishes to the outside world (BlogPosting JSON-LD, OpenGraph
 * article:published_time/modified_time, and the visible published/updated
 * labels on the post page).
 *
 * Why this exists (2026-07-10 bathtub-query forensics, fix shipped 2026-07-13):
 * the BlogPosting schema on an April-published post was observed emitting
 * `datePublished` from a *reset* published_at (an admin re-save had clobbered
 * it to "now") and `dateModified` straight from `updated_at` — a column that
 * bulk maintenance scripts (translation backfills, link rewrites) touch
 * wholesale. At the time of the audit, 89 of 250 blog rows shared one exact
 * updated_at microsecond timestamp, 30 shared another, and 238/250 rows had
 * updated_at > published_at. Fake-fresh dates are a trust signal Google
 * explicitly devalues, so:
 *
 *   - datePublished = published_at, falling back to created_at.
 *   - dateModified  = updated_at ONLY when it looks like a genuine,
 *     row-specific content edit:
 *       (a) it is meaningfully later than the published date
 *           ({@link MIN_MODIFIED_GAP_MS}, same 24h window the visible
 *           "Updated" label always used), AND
 *       (b) it is NOT part of a bulk-touch cluster — i.e. no other blog row
 *           was written within {@link BULK_TOUCH_CLUSTER_WINDOW_MINUTES} of
 *           this row's updated_at. Bulk scripts either stamp every row with
 *           one `now()` inside a single statement (identical microsecond
 *           timestamps) or loop row-by-row with distinct stamps seconds-to-
 *           minutes apart — BOTH are bulk-write fingerprints. The 2026-07-13
 *           review of this fix proved exact-timestamp matching alone leaks:
 *           41 of 237 published rows had unique microsecond stamps yet ALL
 *           traced to sequential bulk runs (e.g. the 36-post cost-index
 *           backfill was written ~9 min apart, 2026-07-04 01:37→07:33). A
 *           time-window cluster catches both shapes; validated against prod:
 *           0 of 237 published rows leak at 60 min. A genuine human edit only
 *           loses its dateModified if another row was written within the same
 *           hour — which fails CLOSED (honest omission), the direction this
 *           module always prefers.
 *     When the cluster size is unknown (callers that didn't fetch it), the
 *     signal is unverifiable and dateModified is OMITTED — omitting is honest;
 *     request-time or bulk-touch timestamps are not.
 *
 * PRECISION WARNING for query authors: Postgres stores updated_at at
 * MICROSECOND precision; a JS Date only holds milliseconds. Never compute the
 * cluster by binding a JS Date back into a WHERE clause — the ms-truncated
 * parameter matches ZERO rows, not even the row itself (this exact bug
 * shipped in the first version of this fix: `eq(updatedAt, row.updatedAt)`
 * made the gate unpassable for every existing row). The cluster count MUST be
 * computed entirely in SQL, keyed by row id, so the microsecond value never
 * round-trips through a JS Date. See getBlogPostBySlugFromDb in
 * lib/db/queries/blog.ts.
 */

/** Minimum gap between published and updated before `updated_at` counts as a
 * real post-publication edit (matches the visible "Updated" label rule). */
export const MIN_MODIFIED_GAP_MS = 24 * 60 * 60 * 1000;

/**
 * Half-width of the bulk-touch detection window, in minutes: a blog row's
 * updated_at is only trusted as a genuine edit when NO other blog row was
 * written within ±this many minutes of it. 60 min suppresses every bulk run
 * observed in prod (single-stamp UPDATEs, the ~9-min-apart cost-index loop,
 * and stragglers written up to ~37 min from their cluster) with zero leaks
 * across all 237 published rows, while a lone human edit an hour clear of any
 * other write still passes. Consumed by the SQL cluster-count queries in
 * lib/db/queries/blog.ts.
 */
export const BULK_TOUCH_CLUSTER_WINDOW_MINUTES = 60;

export interface BlogDateSource {
  /** Publication date (may have been reset by past admin-save bugs). */
  published_at?: Date | string | null;
  /** Row creation date — the fallback publication signal. */
  created_at?: Date | string | null;
  /** Last DB write — poisoned by bulk maintenance scripts; see module doc. */
  updated_at?: Date | string | null;
  /**
   * How many blog rows (published or not — bulk scripts touch both) have an
   * `updated_at` within ±{@link BULK_TOUCH_CLUSTER_WINDOW_MINUTES} of this
   * row's, including this row itself (so >= 1). 1 = isolated write = genuine
   * row-specific edit; >= 2 = bulk-touch cluster; undefined = unknown.
   * MUST be computed in SQL keyed by row id (see PRECISION WARNING above).
   */
  updated_at_cluster_count?: number;
}

export interface ResolvedBlogDates {
  /** ISO 8601 publication timestamp, or undefined when no valid source. */
  datePublished?: string;
  /**
   * ISO 8601 last-genuine-edit timestamp. Undefined whenever `updated_at`
   * cannot be trusted — callers must OMIT the field, not substitute.
   */
  dateModified?: string;
}

function toValidDate(value: Date | string | null | undefined): Date | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Resolve the publicly-emitted dates for a blog post. Pure — safe on both
 * server (JSON-LD/metadata) and client (visible labels). */
export function resolveBlogDates(source: BlogDateSource): ResolvedBlogDates {
  const published = toValidDate(source.published_at) ?? toValidDate(source.created_at);
  const updated = toValidDate(source.updated_at);

  const datePublished = published?.toISOString();

  const isGenuineEdit =
    updated !== undefined &&
    published !== undefined &&
    updated.getTime() > published.getTime() + MIN_MODIFIED_GAP_MS &&
    source.updated_at_cluster_count === 1;

  return {
    ...(datePublished && { datePublished }),
    ...(isGenuineEdit && { dateModified: updated.toISOString() }),
  };
}
