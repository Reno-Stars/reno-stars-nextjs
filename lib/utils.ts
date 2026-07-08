/**
 * Utility functions for the application.
 * @module lib/utils
 */

import type { Locale, Localized } from '@/lib/types';
import { locales, ogLocaleMap } from '@/i18n/config';

// ============================================================================
// ENVIRONMENT UTILITIES
// ============================================================================

/** Canonical site name used across metadata and structured data */
export const SITE_NAME = 'Reno Stars';

// ============================================================================
// LOCALE UTILITIES
// ============================================================================

// Fallback chain for missing translations. zh-Hant prefers Simplified
// (script-conversion is closer than English) before falling back to en.
// All other locales fall back directly to en.
const LOCALE_FALLBACKS: Partial<Record<Locale, ReadonlyArray<Locale>>> = {
  'zh-Hant': ['zh', 'en'],
};

/**
 * Returns the best available translation for a given locale, falling back
 * through LOCALE_FALLBACKS (zh-Hant → zh → en) and finally to en.
 */
export function pickLocale<T>(field: Localized<T>, locale: Locale): T {
  const direct = field[locale] as T | undefined;
  if (direct !== undefined) return direct;
  const chain = LOCALE_FALLBACKS[locale];
  if (chain) {
    for (const fb of chain) {
      const v = field[fb] as T | undefined;
      if (v !== undefined) return v;
    }
  }
  return field.en;
}

/**
 * Same as pickLocale but tolerant of an undefined field — returns undefined
 * when the entire field is missing. Use for optional fields like badge/excerpt.
 */
export function pickLocaleOptional<T>(field: Localized<T> | undefined, locale: Locale): T | undefined {
  if (!field) return undefined;
  return pickLocale(field, locale);
}

/**
 * Collapses a Localized<T> down to only the values needed to render for the
 * CURRENT locale: `en` (the required fallback root) plus the resolved current
 * locale (already fallback-applied via pickLocale). Rendering the result with
 * `pickLocale(result, locale)` returns the identical value as the full field.
 *
 * Why: client components (Navbar/Footer) receive these objects as props, so the
 * WHOLE object is serialized into the RSC flight payload. The full field carries
 * up to 14 locales; shipping only `{ en, <locale> }` cuts that ~7-14×. Used by
 * the layout to strip the nav/footer service+area lists before they cross the
 * server→client boundary (the dominant Fast-Origin-Transfer driver, since pages
 * are force-dynamic and every cache-miss re-ships the payload origin→edge).
 */
export function minimalLocalized<T>(field: Localized<T>, locale: Locale): Localized<T> {
  if (locale === 'en') return { en: field.en };
  return { en: field.en, [locale]: pickLocale(field, locale) } as Localized<T>;
}

/**
 * Returns true when a Localized<string> field has genuine content for the
 * requested locale (or for `en`/`zh`, which always do — they're the source
 * columns). Returns false when the locale would silently fall back to `en`.
 *
 * Use this to drive a dynamic `noindex` on pages whose body would otherwise
 * publish English content under a non-EN URL — Google flags those as duplicate
 * content / soft 404, and the bare /ja/, /ko/, /es/, /pa/, /tl/, /fa/, /vi/,
 * /zh-Hant/ URLs eat crawl budget without contributing rankings.
 *
 * Pass the most "load-bearing" content field (page body, long description) —
 * not the title or short description, which are often translated even when
 * the body isn't.
 */
export function hasNativeContent(
  field: Localized<string> | undefined,
  locale: Locale,
): boolean {
  if (locale === 'en' || locale === 'zh') return true;
  if (!field) return false;
  const v = (field as Record<string, string | undefined>)[locale];
  if (!v) return false;
  return v !== field.en;
}

// Map non-base locales to the camelCase suffix used in the DB localizations
// jsonb. e.g. 'ja' → 'Ja', 'zh-Hant' → 'ZhHant'. The base locales (en, zh)
// have dedicated columns and are not represented in this map.
export const LOCALE_TO_DB_SUFFIX: Partial<Record<Locale, string>> = {
  ja: 'Ja',
  ko: 'Ko',
  es: 'Es',
  pa: 'Pa',
  tl: 'Tl',
  fa: 'Fa',
  vi: 'Vi',
  'zh-Hant': 'ZhHant',
  ru: 'Ru',
  ar: 'Ar',
  hi: 'Hi',
  fr: 'Fr',
};

/**
 * Build a `Localized<string>` shape from a DB row's en/zh columns plus the
 * `localizations` jsonb that holds locale overrides as `${field}<Suffix>`
 * (e.g. `titleJa`, `titleZhHant`). Missing locales are simply omitted —
 * pickLocale handles the fallback chain at read time.
 */
export function buildLocalized(
  fieldName: string,
  en: string,
  zh: string,
  localizations: Record<string, unknown> | null | undefined,
): Localized<string> {
  const result: Localized<string> = { en, zh };
  if (!localizations || typeof localizations !== 'object') return result;
  for (const [loc, suffix] of Object.entries(LOCALE_TO_DB_SUFFIX) as [Locale, string][]) {
    const v = localizations[`${fieldName}${suffix}`];
    if (typeof v === 'string' && v) {
      (result as Record<string, string>)[loc] = v;
    }
  }
  return result;
}

/**
 * Same as buildLocalized but for optional fields where en/zh may be null.
 * Returns undefined when neither en nor zh is present.
 */
export function buildLocalizedOptional(
  fieldName: string,
  en: string | null | undefined,
  zh: string | null | undefined,
  localizations: Record<string, unknown> | null | undefined,
): Localized<string> | undefined {
  if (!en || !zh) return undefined;
  return buildLocalized(fieldName, en, zh, localizations);
}

/**
 * Returns OG-format locale codes (e.g. "zh_CN", "ja_JP") for every locale
 * EXCEPT the current one. Used to populate openGraph.alternateLocale on
 * page-level metadata so social/SEO crawlers know about every translation.
 */
export function buildAlternateLocales(currentLocale: Locale): string[] {
  return locales.filter((l) => l !== currentLocale).map((l) => ogLocaleMap[l]);
}

/**
 * Gets the base URL for the application.
 * Uses NEXT_PUBLIC_BASE_URL environment variable with a fallback.
 * @returns The base URL string
 */
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.reno-stars.com';
  return url.replace(/\/+$/, '');
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Converts a string to a URL-friendly slug.
 * @param text - The text to convert
 * @returns A lowercase, hyphenated slug
 * @example formatSlug('Hello World') // 'hello-world'
 */
export function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Ensures a slug is unique by appending a numeric suffix if needed.
 * Checks existing slugs and appends -2, -3, etc. on collision.
 * @param slug - The desired slug
 * @param existingSlugs - Array of slugs already in use
 * @param excludeSlug - Optional slug to exclude from collision check (for updates)
 * @returns A unique slug string
 * @example ensureUniqueSlug('my-project', ['my-project', 'my-project-2']) // 'my-project-3'
 */
export function ensureUniqueSlug(
  slug: string,
  existingSlugs: string[],
  excludeSlug?: string
): string {
  const taken = new Set(existingSlugs.filter((s) => s !== excludeSlug));
  if (!taken.has(slug)) return slug;

  let suffix = 2;
  const MAX_SUFFIX = 1000;
  while (taken.has(`${slug}-${suffix}`) && suffix < MAX_SUFFIX) {
    suffix++;
  }
  // Fallback to timestamp if max retries exhausted (prevents silent collision)
  if (suffix >= MAX_SUFFIX) {
    return `${slug}-${Date.now()}`;
  }
  return `${slug}-${suffix}`;
}

/**
 * Truncates text to a specified length with ellipsis.
 * @param text - The text to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 * @example truncate('This is long text', 10) // 'This is lo...'
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + '...' : text;
}

/**
 * Truncates text for meta descriptions at word boundaries.
 * Optimized for SEO with a default max length of 155 characters.
 *
 * Strips markdown link syntax `[label](url)` → `label` before measuring +
 * truncating, because service / area `long_description` fields are authored
 * in markdown for rich body rendering but Google SERPs render the raw
 * description string verbatim — leaking brackets+URLs into search results
 * (verified live 2026-05-25: `/en/services/kitchen/` was emitting
 * `<meta name="description" content="[Vancouver](/en/areas/vancouver/) ...">`).
 *
 * Bold/italic/code markers are NOT stripped — they don't appear in current
 * source data and adding them would complicate behavior for callers that
 * pass already-plain text.
 *
 * @param text - The text to truncate (may contain markdown link syntax)
 * @param maxLength - Maximum length (default: 155)
 * @returns Plain-text, truncated at a word boundary with ellipsis if needed
 * @example truncateMetaDescription('[Vancouver](/en/areas/vancouver/) renovations') // 'Vancouver renovations'
 */
export function truncateMetaDescription(text: string, maxLength: number = 155): string {
  if (!text) return text;

  // Strip markdown link syntax: [label](url) → label
  const plain = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  if (plain.length <= maxLength) return plain;

  // Find the last space before maxLength
  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If no space found, just cut at maxLength
  if (lastSpace === -1) return truncated + '...';

  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Expands residual markdown link syntax `[label](url)` → `<a href="url">label</a>`
 * inside heading tags (h1-h6) only.
 *
 * Why: `marked.parse()` passes HTML blocks through unchanged (its
 * documented design choice). When blog body content is authored as HTML
 * that contains markdown link syntax inside the HTML — e.g.
 * `<h1>Vanity Renovation Cost [Vancouver](/en/areas/vancouver/) 2026</h1>` —
 * the markdown stays raw, leaking brackets+parens into the rendered DOM
 * (verified live 2026-05-26 on every `/en/blog/*-cost-vancouver/` page).
 * Sibling fix to PR #57's `truncateMetaDescription` markdown strip.
 *
 * Scope is intentionally limited to heading tags only — body paragraphs
 * may legitimately contain literal `[text](url)` (e.g. tutorials about
 * markdown), but headings essentially never do. If literal brackets ever
 * need to appear in a heading, author the heading as plain markdown
 * (`## Heading [literal] (paren)`) so marked converts the wrapping tag
 * itself instead of relying on HTML pass-through.
 *
 * @param html - HTML string (typically `marked.parse()` output)
 * @returns same HTML with markdown links inside h1-h6 expanded to `<a>` tags
 * @example expandMarkdownLinksInHeadings('<h1>Cost [VAN](/v/) 2026</h1>')
 *          // '<h1>Cost <a href="/v/">VAN</a> 2026</h1>'
 */
export function expandMarkdownLinksInHeadings(html: string): string {
  if (!html) return html;
  return html.replace(
    /(<h[1-6][^>]*>)([\s\S]*?)(<\/h[1-6]>)/gi,
    (_match, open: string, content: string, close: string) => {
      const fixed = content.replace(
        /\[([^\]]+)\]\(([^)\s]+)\)/g,
        '<a href="$2">$1</a>',
      );
      return open + fixed + close;
    },
  );
}

/**
 * Capitalizes the first letter of a string.
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a kebab-case slug to a title-case label.
 * @example slugToLabel('whole-house') // 'Whole House'
 * @example slugToLabel('kitchen') // 'Kitchen'
 */
export function slugToLabel(slug: string): string {
  return slug.split('-').map(capitalize).join(' ');
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Formats a number as Canadian currency.
 * @param amount - The amount to format
 * @returns Formatted currency string
 * @example formatCurrency(1500) // 'CA$1,500.00'
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

/**
 * Clamps a number within a specified range.
 * @param num - The number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns The clamped number
 * @example clamp(15, 1, 10) // 10
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Splits an array into chunks of a specified size.
 * @param arr - The array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 * @example chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

/**
 * Removes duplicates from an array.
 * @param arr - The array to deduplicate
 * @returns Array with unique values
 * @example unique([1, 2, 2, 3]) // [1, 2, 3]
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 * @param arr - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates an email address format using RFC 5322 simplified pattern.
 * More robust than basic regex validation.
 * @param email - The email to validate
 * @returns True if valid email format
 * @example isValidEmail('test@example.com') // true
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic length check (RFC 5321 limit is 254 characters)
  if (email.length > 254) {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email);
}

/**
 * Validates a phone number format (North American).
 * Accepts various formats with at least 10 digits.
 * @param phone - The phone number to validate
 * @returns True if valid phone format
 * @example isValidPhone('(604) 555-0123') // true
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return /^[\d\s\-()+]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validates a Canadian postal code format.
 * @param postalCode - The postal code to validate
 * @returns True if valid Canadian postal code
 * @example isValidPostalCode('V6W 1M2') // true
 */
export function isValidPostalCode(postalCode: string): boolean {
  return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Parses a date value and validates it.
 * @returns A valid Date or null if invalid
 */
function parseDate(date: Date | string): Date | null {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return null;
  }
  return d;
}

/**
 * Formats a date to a localized string.
 * Returns 'Invalid Date' for unparseable inputs.
 * @param date - The date to format
 * @param locale - Locale string (default: 'en-CA')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en-CA'
): string {
  const d = parseDate(date);
  if (!d) return 'Invalid Date';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns a relative time string (e.g., "2 days ago").
 * Returns 'Invalid Date' for unparseable inputs.
 * @param date - The date to compare
 * @param locale - Locale string (default: 'en')
 * @returns Relative time string
 */
export function getRelativeTime(
  date: Date | string,
  locale: string = 'en'
): string {
  const d = parseDate(date);
  if (!d) return 'Invalid Date';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600)
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400)
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000)
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000)
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

// ============================================================================
// METADATA UTILITIES
// ============================================================================

/**
 * Builds the `alternates` object for Next.js page metadata.
 * Produces canonical, en/zh hreflang, and x-default links.
 * @param path - Path without locale prefix (e.g. '/contact/')
 * @param locale - Current locale string
 * @returns Alternates object for Metadata
 */
export function buildAlternates(path: string, locale: string, restrictLocales?: readonly string[]): {
  canonical: string;
  languages: Record<string, string>;
} {
  const baseUrl = getBaseUrl();
  // Generate hreflang alternates for every supported locale. Driven by the
  // canonical `locales` array so adding a new locale doesn't require editing
  // every page's metadata helper. `restrictLocales` narrows the hreflang set
  // for pages whose minor-locale variants are noindexed (untranslated blog
  // posts) — hreflang must not point at non-indexable URLs, and the set here
  // must match what the sitemap emits for the same page.
  const includeLocales = restrictLocales ?? locales;
  const languages: Record<string, string> = {};
  // Emit the hreflang key exactly as the locale slug. `zh-Hant` is a valid
  // BCP-47 script subtag that Google fully supports, and keeping it identical
  // to the URL path (/zh-Hant/), the page's <html lang="zh-Hant">, and the
  // sitemap's xhtml:link alternates is what avoids Semrush "hreflang language
  // mismatch" errors. A previous version remapped zh-Hant → zh-TW here only in
  // the page <head> (the sitemap always emitted zh-Hant), so head and sitemap
  // disagreed on the same /zh-Hant/ URL — the exact mismatch this restores.
  // Removed 2026-06-26 site-audit pass.
  for (const loc of includeLocales) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages['x-default'] = `${baseUrl}/en${path}`;
  return {
    canonical: `${baseUrl}/${locale}${path}`,
    languages,
  };
}

/**
 * Builds the URL for a dynamic OG image via the /api/og endpoint.
 * @param title - Main heading text for the OG image
 * @param subtitle - Optional secondary text
 * @returns Absolute URL to the OG image endpoint
 */
export function buildOgImageUrl(title: string, subtitle?: string): string {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ title });
  if (subtitle) params.set('subtitle', subtitle);
  return `${baseUrl}/api/og/?${params.toString()}`;
}

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Builds a URL with query parameters.
 * @param base - Base URL
 * @param params - Object of query parameters
 * @returns URL string with query parameters
 */
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Removes undefined and null values from an object.
 * @param obj - The object to clean
 * @returns Object without null/undefined values
 */
export function cleanObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}

/**
 * Deep clones an object using structuredClone.
 * Preserves Date objects, ArrayBuffers, Maps, Sets, etc.
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}
