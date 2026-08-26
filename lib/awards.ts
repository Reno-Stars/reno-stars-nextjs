/**
 * Awards, certifications and third-party recognition — the archive behind
 * /awards/.
 *
 * DELIBERATELY EMPTY. This file is the structure, not the content.
 *
 * A contractor's awards page is a trust page, and a trust page that lists an
 * award nobody can verify is worse than no page at all. So nothing is seeded
 * here: `/awards/` renders an honest empty state until a real entry lands, and
 * three things flip automatically the moment `AWARDS` stops being empty:
 *
 *   1. `app/[locale]/awards/page.tsx` drops its `robots: noindex` — an empty
 *      archive is a thin page and should not be in the index.
 *   2. `app/sitemap.ts` starts emitting `/awards/` for all 14 locales.
 *   3. `components/Footer.tsx` adds the quick link.
 *
 * So adding the first award is a one-entry edit to this array, not a hunt
 * through the routing, the sitemap and the footer.
 *
 * ---------------------------------------------------------------------------
 * WHAT AN ENTRY REQUIRES
 *
 * Every field below is mandatory except `url` and `note`, and every one of them
 * has to be checkable by a stranger. If you cannot name the organisation that
 * issued it and the year they issued it, it is not an award — it is a badge,
 * and it does not belong on this page.
 *
 * `title` / `issuer` are NOT translated. An award's name is a proper noun and
 * is quoted as issued; translating "HAVAN Awards for Housing Excellence" into
 * fourteen languages would make it unverifiable in thirteen of them. The
 * surrounding page chrome ("Awarded by", "View announcement") IS translated,
 * from `messages/<locale>/awards.json`.
 */

export interface Award {
  /** Stable slug — the React key and the anchor id. Lowercase, hyphenated. */
  id: string;
  /** Award name, exactly as issued. Not translated (proper noun). */
  title: string;
  /** Organisation that issued it, exactly as it names itself. Not translated. */
  issuer: string;
  /** Calendar year of the award. Drives the year grouping on the page. */
  year: number;
  /**
   * Public announcement, finalist list or certificate page. Optional only
   * because some issuers publish nothing online — prefer having one.
   */
  url?: string;
  /**
   * Short qualifier where the award alone is ambiguous — the category, or
   * "Finalist" rather than "Winner". Keep it factual; it renders verbatim.
   */
  note?: string;
}

/**
 * The archive. Empty until Reno Stars actually wins something.
 *
 * Newest first is not required — the page groups by `year` descending and
 * sorts within a year by title, so insertion order does not matter.
 */
export const AWARDS: readonly Award[] = [];

/** True once there is something real to show. Gates indexing, sitemap, footer. */
export const HAS_AWARDS = AWARDS.length > 0;

/** Awards grouped by year, newest year first, titles A→Z inside each year. */
export function awardsByYear(awards: readonly Award[] = AWARDS): Array<{
  year: number;
  items: Award[];
}> {
  const byYear = new Map<number, Award[]>();
  for (const award of awards) {
    const bucket = byYear.get(award.year);
    if (bucket) bucket.push(award);
    else byYear.set(award.year, [award]);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({
      year,
      items: [...items].sort((a, b) => a.title.localeCompare(b.title)),
    }));
}
