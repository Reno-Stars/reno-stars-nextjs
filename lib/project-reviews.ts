/**
 * Shared helpers for project-linked verified client reviews.
 *
 * Kept in a plain module (no 'use client'/'server-only') because both the
 * server page (app/[locale]/projects/[slug]/page.tsx — JSON-LD) and the
 * client detail page (VerifiedGoogleReviews card) need the same formatting.
 */

/** Serializable review shape passed from the server page into client components. */
export interface ProjectReviewDisplay {
  /** Author name exactly as written on the source review. */
  authorName: string;
  /** Star rating 1-5 (all seeded reviews are 5). */
  rating: number;
  /** Verbatim review text — never translated or edited (it is a quote). */
  body: string;
  /** Language of `body`: 'en' | 'zh'. */
  bodyLang: string;
  /** ISO date string 'YYYY-MM-DD'; month precision (day normalized to 01). */
  reviewDate: string;
  /** Direct URL to the review on the source platform, when available. */
  sourceUrl: string | null;
}

/**
 * Abbreviate a reviewer name for display: first name + last initial,
 * preserving the casing exactly as written on the review
 * (e.g. "Lisa Jung" → "Lisa J.", "shane groves" → "shane g.").
 * Single-word names are returned unchanged.
 */
export function formatReviewerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name.trim();
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0)}.`;
}

/**
 * Truncate a month-precision review date to 'YYYY-MM' for Schema.org
 * `datePublished`. ISO 8601 partial dates are valid — emitting only the
 * month avoids implying a specific day we don't actually know.
 */
export function reviewDateToSchemaDate(reviewDate: string): string {
  return reviewDate.slice(0, 7);
}

/** Map app locales to Intl locales where the plain code isn't ideal. */
const INTL_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  'zh-Hant': 'zh-TW',
  tl: 'fil',
};

/**
 * Localized relative label for a month-precision review date
 * (e.g. "6 months ago", "6个月前"). Month granularity only — matching the
 * precision we actually store. `now` is injectable for tests.
 */
export function relativeReviewDate(reviewDate: string, locale: string, now: Date = new Date()): string {
  const then = new Date(`${reviewDate.slice(0, 7)}-01T00:00:00Z`);
  if (isNaN(then.getTime())) return '';
  const monthsDiff = Math.max(
    0,
    (now.getUTCFullYear() - then.getUTCFullYear()) * 12 + (now.getUTCMonth() - then.getUTCMonth()),
  );
  const intlLocale = INTL_LOCALE_MAP[locale] ?? locale;
  let rtf: Intl.RelativeTimeFormat;
  try {
    rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
  } catch {
    rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  }
  if (monthsDiff >= 12) return rtf.format(-Math.floor(monthsDiff / 12), 'year');
  return rtf.format(-monthsDiff, 'month');
}
