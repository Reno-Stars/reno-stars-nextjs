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
 *           shares the exact same updated_at timestamp. Bulk scripts stamp
 *           every row they touch with the same `now()` inside one statement /
 *           transaction, so microsecond-identical updated_at values across
 *           rows are a bulk-write fingerprint, never independent human edits.
 *     When the cluster size is unknown (callers that didn't fetch it), the
 *     signal is unverifiable and dateModified is OMITTED — omitting is honest;
 *     request-time or bulk-touch timestamps are not.
 */

/** Minimum gap between published and updated before `updated_at` counts as a
 * real post-publication edit (matches the visible "Updated" label rule). */
export const MIN_MODIFIED_GAP_MS = 24 * 60 * 60 * 1000;

export interface BlogDateSource {
  /** Publication date (may have been reset by past admin-save bugs). */
  published_at?: Date | string | null;
  /** Row creation date — the fallback publication signal. */
  created_at?: Date | string | null;
  /** Last DB write — poisoned by bulk maintenance scripts; see module doc. */
  updated_at?: Date | string | null;
  /**
   * How many published blog rows share this row's exact `updated_at`
   * (including this row, so >= 1). 1 = unique timestamp = genuine
   * row-specific edit; >= 2 = bulk-touch cluster; undefined = unknown.
   */
  updated_at_shared_count?: number;
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
    source.updated_at_shared_count === 1;

  return {
    ...(datePublished && { datePublished }),
    ...(isGenuineEdit && { dateModified: updated.toISOString() }),
  };
}
