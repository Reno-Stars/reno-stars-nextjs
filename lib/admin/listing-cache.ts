/**
 * Listing-card change detection for admin content actions.
 *
 * Background: the home page, the section index pages, and the RSS feed all
 * read the broad "listing" cache entries (`blog:listing`, `projects:listing`,
 * `sites:listing`). Those entries are invalidated with `updateTag(...)` whenever
 * a post / project / site changes. The problem is that EVERY edit busted the
 * listing tag — including pure content-body, meta/SEO, and translation edits
 * that never appear on a listing card. Each bust regenerates the home page and
 * feed across all 14 locales, which is the dominant driver of Vercel ISR
 * "Write Units" (the home page was writing ~6× more often than it was read).
 *
 * A listing card only renders a small subset of fields (title, excerpt,
 * featured image, publish state, date). So we only need to bust the listing
 * tag when one of those card-visible fields actually changed. The narrow
 * per-slug tag (`blog:${slug}` etc.) ALWAYS still fires, so the detail page
 * stays fresh on every edit — only the cross-page listing fan-out is gated.
 *
 * Failure mode is safe: if we wrongly skip a bust, the listing shows a
 * stale card until the page's own `revalidate` window (≤24h for home) or the
 * next deploy — both self-heal. When the previous row is unknown we bust.
 */

function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.getTime();
  // Treat undefined/null/'' as distinct only where it matters; DB nulls and
  // empty strings both render as "no value" on a card, so collapse them.
  if (value === undefined || value === null || value === '') return null;
  return value;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return normalize(a) === normalize(b);
}

/**
 * True when any listing-card-visible field differs between the existing row
 * (`oldRow`, selected before the update) and the incoming update (`next`).
 *
 * @param directFields      column/property names that appear on the card
 * @param localizedPrefixes field-name prefixes inside the `localizations`
 *                          jsonb that appear on the card (e.g. `title`,
 *                          `excerpt`). Keys are camelCase `${field}${Suffix}`
 *                          — e.g. `titleJa`, `excerptZhHant` — so we match by
 *                          prefix. `title` matches `titleJa` but not
 *                          `metaTitleJa` (which starts with `meta`).
 */
export function listingCardChanged(
  oldRow: Record<string, unknown> | null | undefined,
  next: Record<string, unknown>,
  directFields: readonly string[],
  localizedPrefixes: readonly string[] = [],
): boolean {
  // Unknown previous state → bust to be safe.
  if (!oldRow) return true;

  for (const field of directFields) {
    if (!valuesEqual(oldRow[field], next[field])) return true;
  }

  if (localizedPrefixes.length > 0) {
    const oldLoc = (oldRow.localizations ?? {}) as Record<string, unknown>;
    const newLoc = (next.localizations ?? {}) as Record<string, unknown>;
    const keys = new Set([...Object.keys(oldLoc), ...Object.keys(newLoc)]);
    for (const key of keys) {
      if (localizedPrefixes.some((p) => key.startsWith(p)) && !valuesEqual(oldLoc[key], newLoc[key])) {
        return true;
      }
    }
  }

  return false;
}

// Card-visible field sets, colocated so the SELECT (which loads the old row)
// and the comparison can't drift apart. Anything NOT listed here — content
// bodies, meta_*/focus_keyword/seo_keywords, dynamic_blocks, reading time,
// descriptions, challenge/solution, content_* translations — is deliberately
// excluded: it never shows on a listing card, so editing it must not bust the
// shared listing cache.
export const BLOG_CARD_FIELDS = [
  'slug',
  'isPublished',
  'publishedAt',
  'titleEn',
  'titleZh',
  'excerptEn',
  'excerptZh',
  'featuredImageUrl',
] as const;
export const BLOG_CARD_LOCALIZED = ['title', 'excerpt'] as const;

export const PROJECT_CARD_FIELDS = [
  'slug',
  'isPublished',
  'featured',
  'titleEn',
  'titleZh',
  'excerptEn',
  'excerptZh',
  'heroImageUrl',
  'heroVideoUrl',
  'locationCity',
  'badgeEn',
  'badgeZh',
  'budgetRange',
  'durationEn',
  'durationZh',
  'spaceTypeEn',
  'spaceTypeZh',
] as const;

export const SITE_CARD_FIELDS = [
  'slug',
  'isPublished',
  'showAsProject',
  'featured',
  'titleEn',
  'titleZh',
  'excerptEn',
  'excerptZh',
  'heroImageUrl',
  'heroVideoUrl',
  'locationCity',
  'badgeEn',
  'badgeZh',
  'budgetRange',
  'durationEn',
  'durationZh',
  'spaceTypeEn',
  'spaceTypeZh',
] as const;
