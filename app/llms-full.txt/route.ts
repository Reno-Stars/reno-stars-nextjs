import { getBaseUrl, SITE_NAME } from '@/lib/utils';
import {
  getCompanyFromDb,
  getServicesFromDb,
  getServiceAreasFromDb,
  getBlogPostsFromDb,
} from '@/lib/db/queries';
import { COMPANY_STATS, CHINESE_BRAND, getYearsExperience } from '@/lib/company-config';
import { getGoogleReviews } from '@/lib/google-reviews';
import { locales } from '@/i18n/config';
import { COST_GUIDES } from '@/lib/seo/cost-guides';

/**
 * /llms-full.txt — the comprehensive companion to the curated /llms.txt.
 *
 * llms.txt is a short, curated index (generated at app/llms.txt/route.ts from
 * the same config/DB sources since 2026-07-09). This route is the
 * "full" variant of the llms.txt convention: a single, always-fresh Markdown
 * document that gives AI answer engines (ChatGPT, Perplexity, Google AI
 * Overviews, Claude) the WHOLE catalog in one fetch — every service with its
 * description, every service area, every cost guide, and the entire blog
 * library with per-article summaries. Generated from the DB so it never drifts.
 *
 * English only: llms.txt is English-primary and the hreflang graph already
 * exposes localized URLs; duplicating the full catalog ×14 locales here would
 * bloat the file for no citation benefit.
 */
export const revalidate = 604800; // 7d — matches sitemap/feed ISR cadence.

const STRIP_HTML = /<[^>]+>/g;

function clean(s: string | undefined | null): string {
  return (s ?? '').replace(STRIP_HTML, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET(): Promise<Response> {
  const base = getBaseUrl();
  const [company, services, areas, posts, googleRating] = await Promise.all([
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
    getBlogPostsFromDb(),
    getGoogleReviews(),
  ]);

  const years = getYearsExperience();
  const en = base + '/en';
  const ratingLine = googleRating.userRatingCount > 0
    ? `${googleRating.rating.toFixed(1)} stars (${googleRating.userRatingCount} verified reviews)`
    : '5.0 stars (verified Google reviews)';

  const header = [
    `# ${SITE_NAME} Construction Inc. — Full Reference`,
    `> Comprehensive machine-readable reference for ${SITE_NAME}, a Metro Vancouver renovation contractor. Founded ${COMPANY_STATS.companyFoundingYear} (legal entity); team brings ${years}+ years of prior renovation industry experience. This is the full companion to /llms.txt.`,
    '',
    '## Company',
    `- Name: ${SITE_NAME} Construction Inc.`,
    `- Chinese Brand Name: ${CHINESE_BRAND.simplified} (Traditional: ${CHINESE_BRAND.traditional})`,
    `- Founded: ${COMPANY_STATS.companyFoundingYear} (legal entity); team brings ${years}+ years of prior industry experience`,
    `- Location: ${company.address || 'Unit 188-21300 Gordon Way, Richmond, BC V6W 1M2'}`,
    `- Phone: ${company.phone || '778-960-7999'}`,
    `- Website: ${base}`,
    `- Languages Served: English, Mandarin, Cantonese, Japanese, Korean, Spanish, and more (${locales.length} locales)`,
    `- Insurance: Up to ${COMPANY_STATS.liabilityCoverage} CGL (Commercial General Liability)`,
    `- Coverage: WCB (WorkSafeBC) on every job`,
    `- Warranty: Up to ${COMPANY_STATS.warrantyYears} years workmanship warranty`,
    `- Experience: ${years}+ years in residential and commercial renovation`,
    `- Projects Completed: ${COMPANY_STATS.projectsCompleted}`,
    `- Google Rating: ${ratingLine}`,
    `- Service Cities: ${areas.length} in Metro Vancouver`,
  ].join('\n');

  const serviceBlock = [
    '',
    `## Services (${services.filter((s) => s.showOnServicesPage !== false).length})`,
    ...services
      .filter((s) => s.showOnServicesPage !== false)
      .map((s) => {
        const desc = clean(s.long_description?.en) || clean(s.description?.en);
        return `### ${clean(s.title?.en) || s.slug}\n${desc}\nURL: ${en}/services/${s.slug}/`;
      }),
  ].join('\n');

  const areaBlock = [
    '',
    `## Service Areas (${areas.length})`,
    ...areas.map((a) => `- ${clean(a.name?.en) || a.slug}: ${en}/areas/${a.slug}/`),
  ].join('\n');

  const guideBlock = [
    '',
    '## Cost Guides (real project data)',
    ...COST_GUIDES.map((g) => `- ${g.label}: ${en}/guides/${g.slug}/`),
  ].join('\n');

  const blogBlock = [
    '',
    `## Blog Articles (${posts.length})`,
    ...posts.map((p) => {
      const title = clean(p.title?.en) || p.slug;
      const summary = clean(p.excerpt?.en);
      const url = `${en}/blog/${p.slug}/`;
      return summary ? `- [${title}](${url}) — ${summary}` : `- [${title}](${url})`;
    }),
  ].join('\n');

  const body = [header, serviceBlock, areaBlock, guideBlock, blogBlock, ''].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
