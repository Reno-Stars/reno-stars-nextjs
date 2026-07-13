/**
 * Shared helpers for project-linked verified client reviews.
 *
 * Kept in a plain module (no 'use client'/'server-only') because both the
 * server page (app/[locale]/projects/[slug]/page.tsx — JSON-LD) and the
 * client detail page (VerifiedGoogleReviews card) need the same formatting.
 */

import { locales } from '@/i18n/config';

/**
 * Review platforms the admin can attribute a verified review to. Kept here (a
 * plain shared module) so the server action's validation and the admin form's
 * <select> read the SAME list and can't drift. 'google' is the default and the
 * only value in the current data; the rest let the owner record a genuine
 * non-Google verified review truthfully (data-integrity / #29). The card UI
 * shows Google branding ONLY for 'google' and a neutral verified mark for the
 * rest, so an unknown/legacy value degrades gracefully.
 */
export const REVIEW_SOURCES = ['google', 'yelp', 'houzz', 'facebook', 'homestars', 'other'] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

/**
 * Languages a verified review body may be recorded in — the site's supported
 * locales that fit the `project_reviews.body_lang` varchar(5) column. This is
 * every locale except `zh-Hant` (7 chars); a Traditional-Chinese review is
 * recorded as `zh` (the body is shown verbatim and lang-agnostically, and `zh`
 * is a valid superset language tag). Widened from the old ['en','zh'] so a
 * Korean/Japanese/French verified review can be recorded truthfully (#10).
 */
export const REVIEW_BODY_LANGS: readonly string[] = locales.filter((l) => l.length <= 5);

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
  /**
   * Review platform ('google', 'yelp', 'houzz', …) from project_reviews.source.
   * Drives platform-accurate card branding — Google mark only when 'google'.
   */
  source: string;
}

/**
 * A project-linked review as shown on the AREA pages ("What {city} clients
 * say") — the card links through to the linked project's case study.
 */
export interface AreaReviewDisplay extends ProjectReviewDisplay {
  /** Slug of the linked published project the review belongs to. */
  projectSlug: string;
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

/**
 * Canonical app-locale → Intl-locale map for relative-time formatting, shared
 * by every review surface so they never fork (dedup #16-21e). Only locales
 * whose plain BCP-47 code isn't ideal for `Intl` need an entry: `tl` is the
 * deprecated Tagalog code (canonical `fil`), and zh/zh-Hant pin the script
 * region. Every other supported locale (ja, ko, es, fr, ru, ar, fa, hi, pa,
 * vi) is a valid Intl code and passes through unchanged.
 */
export const INTL_LOCALE_MAP: Record<string, string> = {
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

/**
 * Localized relative label for a Google review's full publish timestamp
 * (e.g. "2 days ago", "3か月前"). Day/month/year granularity — matching the
 * precision Google returns in `publishTime`, so it differs from the
 * month-only `relativeReviewDate` above (which formats our stored review
 * dates). ONE shared copy for the home marquee (TestimonialsSection) and the
 * reviews hub (ReviewsPage) so they can't drift onto an English "en-US"
 * fallback on ja/ko/es/… (H4 dedup). Returns '' for empty/unparseable input.
 * `now` is injectable for tests.
 */
export function relativeGoogleReviewTime(publishTime: string, locale: string, now: Date = new Date()): string {
  if (!publishTime) return '';
  const timestamp = new Date(publishTime).getTime();
  if (isNaN(timestamp)) return '';
  const MS_PER_DAY = 86_400_000;
  const diff = now.getTime() - timestamp;
  const days = Math.floor(diff / MS_PER_DAY);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  const intlLocale = INTL_LOCALE_MAP[locale] ?? locale;
  let rtf: Intl.RelativeTimeFormat;
  try {
    rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
  } catch {
    rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  }
  if (years > 0) return rtf.format(-years, 'year');
  if (months > 0) return rtf.format(-months, 'month');
  if (days > 0) return rtf.format(-days, 'day');
  return rtf.format(0, 'day');
}

/**
 * Floor a LIVE review count to the nearest 5 for "N+" social-proof copy
 * (e.g. 77 → 75, rendered as "75+"). Reads the count from the Google SSOT,
 * never a hardcoded literal. Returns 0 when the count is absent or below 5 so
 * callers fall back to a count-free label instead of an awkward "0+".
 */
export function flooredReviewCount(reviewCount?: number | null): number {
  if (!reviewCount || reviewCount < 5) return 0;
  return Math.floor(reviewCount / 5) * 5;
}
