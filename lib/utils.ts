/**
 * Utility functions for the application.
 * @module lib/utils
 */

// ============================================================================
// ENVIRONMENT UTILITIES
// ============================================================================

/** Canonical site name used across metadata and structured data */
export const SITE_NAME = 'Reno Stars';

/**
 * Gets the base URL for the application.
 * Uses NEXT_PUBLIC_BASE_URL environment variable with a fallback.
 * @returns The base URL string
 */
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL || 'https://reno-stars.com';
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
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 155)
 * @returns Truncated text ending at a word boundary with ellipsis if needed
 * @example truncateMetaDescription('This is a very long description text') // Full text or truncated at word boundary
 */
export function truncateMetaDescription(text: string, maxLength: number = 155): string {
  if (!text || text.length <= maxLength) return text;

  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If no space found, just cut at maxLength
  if (lastSpace === -1) return truncated + '...';

  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Capitalizes the first letter of a string.
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  return /^[\d\s\-\(\)\+]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
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
export function buildAlternates(path: string, locale: string): {
  canonical: string;
  languages: { en: string; zh: string; 'x-default': string };
} {
  const baseUrl = getBaseUrl();
  return {
    canonical: `${baseUrl}/${locale}${path}`,
    languages: {
      en: `${baseUrl}/en${path}`,
      zh: `${baseUrl}/zh${path}`,
      'x-default': `${baseUrl}/en${path}`,
    },
  };
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
  const url = new URL(base);
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
