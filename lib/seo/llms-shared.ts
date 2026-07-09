import { SITE_NAME } from '@/lib/utils';
import { COMPANY_STATS, LOCALIZED_BRAND_NAMES, getYearsExperience } from '@/lib/company-config';
import { locales } from '@/i18n/config';
import type { Company } from '@/lib/types';


/**
 * Shared company-facts builders for /llms.txt and /llms-full.txt. Both routes
 * MUST render the identical fact sheet — hand-synced copies were exactly the
 * drift channel (review count, area count) the generated routes replaced.
 *
 * Contact fallbacks: the company DB row is the runtime source; these literals
 * only apply when a fresh/empty DB row has blank strings (queries.ts
 * COMPANY_FALLBACK uses '' for phone/email/address).
 */
export const CONTACT_FALLBACKS = {
  address: 'Unit 188-21300 Gordon Way, Richmond, BC V6W 1M2',
  phone: '778-960-7999',
  email: 'info@reno-stars.com',
} as const;

export function legalName(): string {
  return `${SITE_NAME} Construction Inc.`;
}

export function buildRatingLine(googleRating: { rating: number; userRatingCount: number }): string {
  return googleRating.userRatingCount > 0
    ? `${googleRating.rating.toFixed(1)} stars (${googleRating.userRatingCount} verified reviews)`
    : '5.0 stars (verified Google reviews)';
}

/** The canonical "## Company Info" bullet list both llms routes emit. */
export function buildCompanyFactLines(
  company: Company,
  areasCount: number,
  googleRating: { rating: number; userRatingCount: number },
  baseUrl: string,
): string[] {
  const years = getYearsExperience();
  return [
    `- Name: ${legalName()}`,
    `- Local Brand Names: ${Object.entries(LOCALIZED_BRAND_NAMES).map(([lc, n]) => `${n} (${lc})`).join(', ')} — also known as "${SITE_NAME}" in every language`,
    `- Founded: ${COMPANY_STATS.companyFoundingYear} (legal entity); team brings ${years}+ years of prior industry experience`,
    `- Location: ${company.address || CONTACT_FALLBACKS.address}`,
    `- Phone: ${company.phone || CONTACT_FALLBACKS.phone}`,
    `- Email: ${company.email || CONTACT_FALLBACKS.email}`,
    `- Website: ${baseUrl}`,
    `- Languages Served: English, Mandarin, Cantonese, Japanese, Korean, Spanish, and more — site available in ${locales.length} languages`,
    `- Insurance: Up to ${COMPANY_STATS.liabilityCoverage} CGL (Commercial General Liability)`,
    `- Coverage: WCB (WorkSafeBC) on every job`,
    `- Warranty: Up to ${COMPANY_STATS.warrantyYears} years workmanship warranty`,
    `- Experience: ${years}+ years in residential and commercial renovation`,
    `- Projects Completed: ${COMPANY_STATS.projectsCompleted}`,
    `- Google Rating: ${buildRatingLine(googleRating)}`,
    `- Service Cities: ${areasCount} in Metro Vancouver`,
  ];
}
