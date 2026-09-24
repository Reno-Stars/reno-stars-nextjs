import { getBaseUrl } from '@/lib/utils';

/**
 * `@id` of the ONE canonical business node (LocalBusinessSchema, mounted in
 * the locale layout on every page). Page-level schemas point at the business
 * with `organizationRef()` instead of redeclaring it: Google merges nodes by
 * @id, so a second typed copy — especially one with its own address or
 * aggregateRating — reads as a separate business or a conflicting rating.
 */
export function organizationId(): string {
  return `${getBaseUrl()}/#organization`;
}

/** A bare JSON-LD reference to the canonical business node. */
export function organizationRef(): { '@id': string } {
  return { '@id': organizationId() };
}

/** True when there is no named author, or the byline is the company itself
 *  (e.g. "Reno Stars", "Reno Stars Team"). */
export function isCompanyByline(authorName: string | undefined, companyName: string): boolean {
  if (!authorName?.trim()) return true;
  const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ');
  const byline = norm(authorName);
  const company = norm(companyName);
  return byline === company || byline === `${company} team`;
}

/**
 * Article `author`: a real byline is a Person; a missing or team byline
 * ("Reno Stars Team") is the company, referenced by @id — typing a team as a
 * Person is a fabricated author.
 */
export function articleAuthor(authorName: string | undefined, companyName: string): Record<string, string> {
  return isCompanyByline(authorName, companyName)
    ? organizationRef()
    : { '@type': 'Person', name: authorName!.trim() };
}
