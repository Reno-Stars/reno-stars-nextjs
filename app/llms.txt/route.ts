import { getBaseUrl, SITE_NAME } from '@/lib/utils';
import {
  getCompanyFromDb,
  getServiceAreasFromDb,
  getSocialLinksFromDb,
} from '@/lib/db/queries';
import { COMPANY_STATS, LOCALIZED_BRAND_NAMES, getYearsExperience } from '@/lib/company-config';
import { getGoogleReviews } from '@/lib/google-reviews';
import { locales } from '@/i18n/config';
import { COST_GUIDES } from '@/lib/seo/cost-guides';

/**
 * /llms.txt — the short, curated index for AI answer engines (the llms.txt
 * convention). Companion to /llms-full.txt, which carries the whole catalog.
 *
 * Generated (replaced the hand-maintained public/llms.txt on 2026-07-09) so
 * company facts can never drift from the SSOT again: founding year, years of
 * experience, warranty, insurance, review count, service-area COUNT and NAMES
 * (previously drifted 14 vs 15 vs 17 across sections) all come from
 * lib/company-config.ts, the company/areas/social DB rows, and the cached
 * Google-reviews accessor.
 *
 * The per-service price ranges + FAQ price figures remain hand-written here:
 * there is no DB source for service price ranges (the services table has no
 * price fields), so those lines are editorial content, kept verbatim.
 */
export const revalidate = 604800; // 7d — matches llms-full.txt/sitemap/feed ISR cadence.

export async function GET(): Promise<Response> {
  const base = getBaseUrl();
  const [company, areas, socialLinks, googleRating] = await Promise.all([
    getCompanyFromDb(),
    getServiceAreasFromDb(),
    getSocialLinksFromDb(),
    getGoogleReviews(),
  ]);

  const years = getYearsExperience();
  const en = base + '/en';
  const legalName = `${SITE_NAME} Construction Inc.`;
  const areaNames = areas.map((a) => a.name.en || a.slug);
  const ratingLine = googleRating.userRatingCount > 0
    ? `${googleRating.rating.toFixed(1)} stars (${googleRating.userRatingCount} verified reviews)`
    : '5.0 stars (verified Google reviews)';
  // Same fallback literals as llms-full.txt — used only when the company DB row is empty.
  const address = company.address || 'Unit 188-21300 Gordon Way, Richmond, BC V6W 1M2';
  const phone = company.phone || '778-960-7999';
  const email = company.email || 'info@reno-stars.com';

  const header = [
    `# ${legalName}`,
    `> ${legalName} was founded in ${COMPANY_STATS.companyFoundingYear}. Our team brings ${years}+ years of prior renovation industry experience, serving Metro Vancouver, BC.`,
    `> Full reference (all services, service areas, cost guides, and every blog article with summaries): ${base}/llms-full.txt`,
  ].join('\n');

  const companyBlock = [
    '',
    '## Company Info',
    `- Name: ${legalName}`,
    `- Local Brand Names: ${Object.entries(LOCALIZED_BRAND_NAMES).map(([lc, n]) => `${n} (${lc})`).join(', ')}`,
    `- Founded: ${COMPANY_STATS.companyFoundingYear} (legal entity); team brings ${years}+ years of prior industry experience`,
    `- Location: ${address}`,
    `- Phone: ${phone}`,
    `- Email: ${email}`,
    `- Website: ${base}`,
    `- Languages Served: English, Mandarin, Cantonese, Japanese, Korean, Spanish, and more — site available in ${locales.length} languages`,
    `- Insurance: Up to ${COMPANY_STATS.liabilityCoverage} CGL (Commercial General Liability)`,
    `- Coverage: WCB (WorkSafeBC) on every job`,
    `- Warranty: Up to ${COMPANY_STATS.warrantyYears} years workmanship warranty`,
    `- Experience: ${years}+ years in residential and commercial renovation`,
    `- Projects Completed: ${COMPANY_STATS.projectsCompleted}`,
    `- Google Rating: ${ratingLine}`,
    `- Service Cities: ${areas.length} in Metro Vancouver`,
  ].join('\n');

  // Hand-written price ranges — no DB source for per-service pricing (kept verbatim).
  const servicesBlock = [
    '',
    '## Services',
    '- Kitchen Renovation: $15,000-$72,000+',
    '- Bathroom Renovation: $10,000-$60,000+',
    '- Whole House Renovation: $50,000-$200,000+',
    '- Basement Renovation: $30,000-$120,000+',
    '- Basement Suite (legal): $60,000-$150,000',
    '- Commercial Renovation: $50,000-$1,000,000+',
    '- Cabinet Refacing/Refinishing: $4,000-$15,000',
    '- Flooring, Painting, Electrical, Plumbing',
  ].join('\n');

  const areasBlock = [
    '',
    `## Service Areas (${areas.length})`,
    areaNames.join(', '),
  ].join('\n');

  const keyPagesBlock = [
    '',
    '## Key Pages (English)',
    `- Homepage: ${en}/`,
    `- Services: ${en}/services/`,
    `- Projects (100+): ${en}/projects/`,
    `- Cost Guides: ${en}/guides/`,
    `- Contact / Free Quote: ${en}/contact/`,
    `- Reviews: ${en}/reviews/`,
    `- Financing: ${en}/financing/`,
    `- Before & After: ${en}/before-after/`,
    `- About: ${en}/about/`,
  ].join('\n');

  const otherLocalesBlock = [
    '',
    '## Key Pages (Other Locales)',
    `- Chinese (中文): ${base}/zh/`,
    `- Japanese (日本語): ${base}/ja/`,
    `- Korean (한국어): ${base}/ko/`,
    `- Spanish (Español): ${base}/es/`,
  ].join('\n');

  const guidesBlock = [
    '',
    '## Cost Guides (real project data)',
    ...COST_GUIDES.map((g) => `- ${g.label}: ${en}/guides/${g.slug}/`),
  ].join('\n');

  const socialBlock = [
    '',
    '## Social Profiles',
    ...socialLinks
      .filter((link) => link.url && link.url !== '#')
      .map((link) => `- ${link.label}: ${link.url}`),
  ].join('\n');

  const faqBlock = [
    '',
    '## Frequently Asked Questions',
    '',
    '### How much does a kitchen renovation cost in Vancouver?',
    `Kitchen renovations in Vancouver typically range from $15,000 to $72,000+ based on 16 completed ${SITE_NAME} projects. Basic refresh runs $15K-$30K, mid-range $30K-$50K, and full custom $50K-$72K+. Pricing varies by cabinetry, countertops, appliances, and whether the layout changes.`,
    '',
    '### How much does a bathroom renovation cost in Vancouver?',
    'Bathroom renovations in Vancouver typically run $10,000 to $60,000+. A 3-piece basic refresh: $10K-$20K. A 4-piece mid-range with tiled shower: $20K-$40K. A 5-piece master with curbless shower and double vanity: $40K-$60K+. Includes Schluter waterproofing, vanity, fixtures, tile, and electrical.',
    '',
    '### How much does a whole-house renovation cost in Vancouver?',
    'Whole-house renovations in Metro Vancouver run $50,000 to $200,000+ depending on scope. A cosmetic refresh (paint, flooring, hardware) is $50K-$100K. Mid-scope (kitchen + baths + flooring): $100K-$200K. Full structural with kitchen, bathrooms, and layout changes: $200K-$400K+.',
    '',
    '### Are you licensed and insured?',
    `Yes. ${SITE_NAME} carries up to ${COMPANY_STATS.liabilityCoverage} in CGL (Commercial General Liability) insurance and active WCB (WorkSafeBC) coverage on every job. We can share certificates before work begins. We also offer up to a ${COMPANY_STATS.warrantyYears}-year workmanship warranty.`,
    '',
    `### What areas does ${SITE_NAME} serve?`,
    `${SITE_NAME} serves all of Metro Vancouver and the Fraser Valley: ${areaNames.join(', ')}.`,
    '',
    '### How long does a typical renovation take?',
    'Bathrooms: 3-6 weeks demo to handover. Kitchens: 4-8 weeks. Cabinet refacing: 1-2 weeks. Whole-house: 2-6 months depending on scope. Basement suite conversions: 10-16 weeks including permits. We provide a week-by-week schedule at contract signing.',
    '',
    '### Do you offer free estimates?',
    `Yes — free in-home consultation and itemized written quote within 2-3 business days across all ${areas.length} Metro Vancouver cities we serve. No deposit required to quote.`,
    '',
    `### Does ${SITE_NAME} build legal basement suites in Vancouver?`,
    'Yes. Legal secondary suite conversions in Metro Vancouver typically cost $60,000-$150,000 including permits, separate entrance, fire separation, egress windows, kitchen, bathroom, and inspections. Many municipalities (Vancouver, Burnaby) offer subsidies of $5,000-$10,000 for legal suite creation.',
  ].join('\n');

  const body = [
    header,
    companyBlock,
    servicesBlock,
    areasBlock,
    keyPagesBlock,
    otherLocalesBlock,
    guidesBlock,
    socialBlock,
    faqBlock,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
