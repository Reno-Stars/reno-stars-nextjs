import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery } from '../cache';
import { COMPANY_STATS, getYearsExperience } from '@/lib/company-config';
import { companyInfo } from '../schema';
import { getAssetUrl } from '../../storage';
import type { Company } from '../../types';

/**
 * Fallback Company used when the DB read fails or the row is missing.
 */
export const COMPANY_FALLBACK: Company = (() => {
  const { companyFoundingYear, teamSize, projectsCompleted, liabilityCoverage } = COMPANY_STATS;
  return {
    name: 'Reno Stars', tagline: '', phone: '', email: '', address: '',
    logo: '', quoteUrl: '/contact/',
    yearsExperience: getYearsExperience(),
    // `foundingYear` here feeds ONLY the AnswerBlock "…founded in {year}" copy,
    // so it must be the LEGAL incorporation year of Reno Stars Construction Inc.
    // (2020), NOT the team's renovation-start year (COMPANY_STATS.foundingYear,
    // 2007) which drives the separate "20+ years experience" stat via
    // getYearsExperience(). Using 2020 keeps the homepage consistent with
    // llms.txt + LocalBusinessSchema.foundingDate ("founded 2020; team brings
    // 20+ years of prior industry experience"). Previously showed "founded in
    // 2007", contradicting both — fixed 2026-07 site-consistency pass.
    foundingYear: companyFoundingYear, teamSize, projectsCompleted, liabilityCoverage,
    heroVideoUrl: '', heroImageUrl: '',
    geo: { latitude: 0, longitude: 0 },
  };
})();

/**
 * Fetch company info from DB and map to the `Company` type.
 * Stats (yearsExperience, teamSize, warranty, liabilityCoverage) come from
 * `lib/company-config.ts`, not the database.
 */
export const fetchCompany = async (): Promise<Company> => {
  return safeQuery('getCompanyFromDb', async () => {
    const rows = await db.select().from(companyInfo).limit(1);
    const row = rows[0];

    if (!row) return COMPANY_FALLBACK;

    return {
      name: row.name,
      tagline: row.tagline ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      address: row.address ?? '',
      logo: getAssetUrl(row.logoUrl ?? ''),
      quoteUrl: row.quoteUrl ?? '/contact/',
      yearsExperience: COMPANY_FALLBACK.yearsExperience,
      foundingYear: COMPANY_FALLBACK.foundingYear,
      teamSize: COMPANY_FALLBACK.teamSize,
      projectsCompleted: COMPANY_FALLBACK.projectsCompleted,
      liabilityCoverage: COMPANY_FALLBACK.liabilityCoverage,
      heroVideoUrl: row.heroVideoUrl ? getAssetUrl(row.heroVideoUrl) : '',
      heroImageUrl: row.heroImageUrl ? getAssetUrl(row.heroImageUrl) : '',
      geo: {
        latitude: parseFloat(row.geoLatitude ?? '') || 0,
        longitude: parseFloat(row.geoLongitude ?? '') || 0,
      },
    };
  }, COMPANY_FALLBACK);
};
// Content-tagged: busted by company edits → updates feature pages (e.g. /contact).
export const getCompanyFromDb = cachedQuery(fetchCompany, ['getCompanyFromDb'], { tags: ['company'] });
// Nav-tagged: read ONLY by the global layout/footer. Decoupled from `company` so a
// company edit no longer regenerates every page — refreshes on TTL (≤24h) or a
// `nav:globals` bust. See ISR Phase 2 (2026-06-05). Same pattern for the 3 globals below.
export const getCompanyForNav = cachedQuery(fetchCompany, ['getCompanyForNav'], { tags: ['nav:globals'] });
