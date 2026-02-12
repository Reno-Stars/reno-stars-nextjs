/**
 * Safely get a string value from FormData.
 * Returns empty string if the field is missing or not a string.
 */
export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Validate that a string is a valid URL-safe slug.
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 100;
}

/** Maximum length for long text fields (content, descriptions, challenges, solutions). */
export const MAX_TEXT_LENGTH = 50_000;

/** Maximum length for short text fields (titles, excerpts, names). */
export const MAX_SHORT_TEXT_LENGTH = 1_000;

/** Maximum length for contact notes. */
export const MAX_NOTES_LENGTH = 5_000;

/** Valid contact statuses. */
export const CONTACT_STATUSES = ['new', 'contacted', 'converted', 'rejected'] as const;
export type ContactStatus = typeof CONTACT_STATUSES[number];

/**
 * Validate that a string is a valid URL (http, https, or relative path).
 * Returns true for empty strings (optional fields).
 */
export function isValidUrl(url: string): boolean {
  if (!url) return true;
  // Allow relative paths starting with /
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if any text field exceeds the maximum length.
 * Returns an error message if validation fails, null otherwise.
 */
export function validateTextLengths(
  fields: Record<string, string | null | undefined>,
  maxLength = MAX_TEXT_LENGTH
): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (value && value.length > maxLength) {
      return `${name} exceeds maximum length of ${maxLength.toLocaleString()} characters.`;
    }
  }
  return null;
}

/** Database image pair row shape (from schema) */
export interface DbImagePairRow {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  titleEn: string | null;
  titleZh: string | null;
  captionEn: string | null;
  captionZh: string | null;
  photographerCredit: string | null;
  keywords: string | null;
}

/** Form-compatible image pair shape */
export interface FormImagePair {
  beforeUrl: string;
  beforeAltEn: string;
  beforeAltZh: string;
  afterUrl: string;
  afterAltEn: string;
  afterAltZh: string;
  titleEn: string;
  titleZh: string;
  captionEn: string;
  captionZh: string;
  photographerCredit: string;
  keywords: string;
}

/** Map a DB image pair row to form-compatible shape */
export function mapDbImagePairToForm(p: DbImagePairRow): FormImagePair {
  return {
    beforeUrl: p.beforeImageUrl ?? '',
    beforeAltEn: p.beforeAltTextEn ?? '',
    beforeAltZh: p.beforeAltTextZh ?? '',
    afterUrl: p.afterImageUrl ?? '',
    afterAltEn: p.afterAltTextEn ?? '',
    afterAltZh: p.afterAltTextZh ?? '',
    titleEn: p.titleEn ?? '',
    titleZh: p.titleZh ?? '',
    captionEn: p.captionEn ?? '',
    captionZh: p.captionZh ?? '',
    photographerCredit: p.photographerCredit ?? '',
    keywords: p.keywords ?? '',
  };
}
