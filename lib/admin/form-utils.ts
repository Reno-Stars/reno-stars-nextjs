/**
 * Safely get a string value from FormData.
 * Returns empty string if the field is missing or not a string.
 */
export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validate that a string is a valid URL-safe slug.
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length <= 100;
}
