import { Link } from '@/navigation';
import { CARD, GOLD, NAVY, SURFACE_ALT, TEXT, TEXT_MID, neu } from '@/lib/theme';

/**
 * Hub of clickable cost-guide links on the homepage. Mirrors the
 * BlogPostPage (added 2026-04-30) + ServiceDetailPage + AreaPage (PR #96,
 * 2026-05-30) pattern that funnels traffic INTO the cost-guides at
 * /guides/<service>-renovation-cost-vancouver/.
 *
 * Per GSC queue 2026-05-30, the cost-guides sit at striking-distance
 * pos 8-14 for high-impression cost queries (300-750 impr/28d, 0% CTR).
 * The HOMEPAGE was the largest remaining inbound surface that had zero
 * cost-guide links — it's the #1-indexed page on the site and the
 * natural funnel-top for renovation cost research. Closing this gap
 * completes the topical-authority pyramid: every major surface (home,
 * area, service, blog) now links to the cost-guide cluster.
 *
 * Order matches GSC impression volume on the corresponding query — kitchen
 * + bathroom first (highest commercial intent), basement + whole-house
 * second (high value but lower volume), commercial + cabinet third (long-
 * tail). Server component (no client JS); zero impact on Core Web Vitals.
 *
 * Labels are English-only — matches the BlogPostPage precedent. i18n keys
 * for these specific labels aren't wired (would need 14 locales × 6 labels
 * = 84 new keys); the URL paths route to localized guide pages regardless,
 * so a /zh/ visitor clicking 'Kitchen Renovation Cost' lands on /zh/guides/
 * kitchen-renovation-cost-vancouver/ with the localized body. Acceptable
 * vs. introducing 84 missing-key warnings.
 */
const COST_GUIDES = [
  { slug: 'kitchen-renovation-cost-vancouver', label: 'Kitchen Renovation Cost' },
  { slug: 'bathroom-renovation-cost-vancouver', label: 'Bathroom Renovation Cost' },
  { slug: 'basement-renovation-cost-vancouver', label: 'Basement Renovation Cost' },
  { slug: 'whole-house-renovation-cost-vancouver', label: 'Whole-House Renovation Cost' },
  { slug: 'commercial-renovation-cost-vancouver', label: 'Commercial Renovation Cost' },
  { slug: 'cabinet-refinishing-cost-vancouver', label: 'Cabinet Refinishing Cost' },
];

export default function CostGuidesLinkSection() {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: TEXT }}>
          Real Renovation Costs in Vancouver
        </h2>
        <p className="text-base text-center mb-8 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
          Real project pricing by service — from 100+ completed Metro Vancouver renovations. No estimates, no filler.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {COST_GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}` as '/guides/kitchen-renovation-cost-vancouver'}
              className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
            >
              {g.label}
            </Link>
          ))}
        </div>
        {/* Cross-link to /financing/ — completes the financing-inbound rollout
            across the 4 cost-guide-chip-rendering surfaces (sibling commits
            73a5c74 BlogPostPage, d90bb97 AreaPage, 9a4a398 ServiceDetailPage).
            HomePage is the #1-indexed page on the site; this gives /financing/
            its single most-authoritative inbound edge. CTA-tagline form
            matches the other 3 surfaces — reads as a transition (just
            absorbed cost ranges → "how do I pay?"). */}
        <p className="text-center mt-6 text-sm" style={{ color: TEXT_MID }}>
          Wondering how to pay for your renovation?{' '}
          <Link
            href="/financing"
            className="font-semibold underline hover:no-underline"
            style={{ color: GOLD }}
          >
            See financing options →
          </Link>
        </p>
      </div>
    </section>
  );
}
