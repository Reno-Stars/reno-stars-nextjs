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

/** Validate parsed image pair URLs (images and videos). Returns error message or null. */
export function validatePairUrls(pairData: ParsedImagePair[]): string | null {
  const checks: [keyof ParsedImagePair, string][] = [
    ['beforeImageUrl', 'Before image'],
    ['afterImageUrl', 'After image'],
    ['beforeVideoUrl', 'Before video'],
    ['afterVideoUrl', 'After video'],
  ];
  for (const [field, label] of checks) {
    for (const p of pairData) {
      const val = p[field];
      if (typeof val === 'string' && val && !isValidUrl(val)) {
        return `${label} URL is not valid: ${val.slice(0, 60)}`;
      }
    }
  }
  return null;
}

/** Validate external product URLs. Returns error message or null. */
export function validateExternalProductUrls(
  epData: { url: string; imageUrl: string | null }[]
): string | null {
  const invalidUrl = epData.find((ep) => !isValidUrl(ep.url));
  if (invalidUrl) return `External product URL is not valid: ${invalidUrl.url.slice(0, 60)}`;
  const invalidImgUrl = epData.find((ep) => ep.imageUrl && !isValidUrl(ep.imageUrl));
  if (invalidImgUrl) return `External product image URL is not valid: ${invalidImgUrl.imageUrl?.slice(0, 60) ?? ''}`;
  return null;
}

/** Database image pair row shape (from schema) */
export interface DbImagePairRow {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  beforeVideoUrl: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  afterVideoUrl: string | null;
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
  beforeVideoUrl: string;
  afterUrl: string;
  afterAltEn: string;
  afterAltZh: string;
  afterVideoUrl: string;
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
    beforeVideoUrl: p.beforeVideoUrl ?? '',
    afterUrl: p.afterImageUrl ?? '',
    afterAltEn: p.afterAltTextEn ?? '',
    afterAltZh: p.afterAltTextZh ?? '',
    afterVideoUrl: p.afterVideoUrl ?? '',
    titleEn: p.titleEn ?? '',
    titleZh: p.titleZh ?? '',
    captionEn: p.captionEn ?? '',
    captionZh: p.captionZh ?? '',
    photographerCredit: p.photographerCredit ?? '',
    keywords: p.keywords ?? '',
  };
}

/** Parsed image pair data ready for DB insertion */
export interface ParsedImagePair {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  beforeVideoUrl: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  afterVideoUrl: string | null;
  titleEn: string | null;
  titleZh: string | null;
  captionEn: string | null;
  captionZh: string | null;
  photographerCredit: string | null;
  keywords: string | null;
  displayOrder: number;
}

/**
 * Parse image pairs from FormData with a given prefix.
 * @param formData - The form data to parse
 * @param prefix - The field prefix (e.g., 'imagePairs' or 'siteImagePairs')
 * @param maxPairs - Maximum number of pairs to parse (default: 50)
 */
export function parseImagePairs(
  formData: FormData,
  prefix: string,
  maxPairs = 50
): ParsedImagePair[] {
  const pairs: ParsedImagePair[] = [];
  let i = 0;
  while (formData.has(`${prefix}[${i}].id`) && i < maxPairs) {
    const beforeUrl = getString(formData, `${prefix}[${i}].beforeUrl`).trim();
    const afterUrl = getString(formData, `${prefix}[${i}].afterUrl`).trim();
    const beforeVideoUrl = getString(formData, `${prefix}[${i}].beforeVideoUrl`).trim();
    const afterVideoUrl = getString(formData, `${prefix}[${i}].afterVideoUrl`).trim();
    // Skip pairs with no images and no videos
    if (!beforeUrl && !afterUrl && !beforeVideoUrl && !afterVideoUrl) { i++; continue; }
    pairs.push({
      beforeImageUrl: beforeUrl || null,
      beforeAltTextEn: getString(formData, `${prefix}[${i}].beforeAltEn`) || null,
      beforeAltTextZh: getString(formData, `${prefix}[${i}].beforeAltZh`) || null,
      beforeVideoUrl: beforeVideoUrl || null,
      afterImageUrl: afterUrl || null,
      afterAltTextEn: getString(formData, `${prefix}[${i}].afterAltEn`) || null,
      afterAltTextZh: getString(formData, `${prefix}[${i}].afterAltZh`) || null,
      afterVideoUrl: afterVideoUrl || null,
      titleEn: getString(formData, `${prefix}[${i}].titleEn`) || null,
      titleZh: getString(formData, `${prefix}[${i}].titleZh`) || null,
      captionEn: getString(formData, `${prefix}[${i}].captionEn`) || null,
      captionZh: getString(formData, `${prefix}[${i}].captionZh`) || null,
      photographerCredit: getString(formData, `${prefix}[${i}].photographerCredit`) || null,
      keywords: getString(formData, `${prefix}[${i}].keywords`) || null,
      displayOrder: i,
    });
    i++;
  }
  return pairs;
}
