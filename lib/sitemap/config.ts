import { HAS_AWARDS } from '@/lib/awards';

/**
 * Static configuration for the sitemap, lifted VERBATIM out of the former
 * single-function `app/sitemap.ts` when it was split into per-file sections
 * (2026-09-02). Nothing here changed in that move — the priority buckets, the
 * static page list and the cost-guide slug set are byte-identical to what the
 * one-file sitemap used, so the split cannot silently alter a single URL's
 * priority, changefreq or tier. See lib/sitemap/sections.ts for the split.
 */

export const PRIORITY = {
  home: 1.0,
  hub: 0.9,
  guide: 0.85,
  serviceArea: 0.8,
  area: 0.8,
  serviceLeaf: 0.75,
  projectLeaf: 0.7,
  blog: 0.65,
  secondary: 0.5,
} as const;

// Pages that change "weekly" (curated content), monthly (catalog), yearly (legal).

export const CHANGEFREQ = {
  weekly: 'weekly' as const,
  monthly: 'monthly' as const,
  yearly: 'yearly' as const,
};

export const STATIC_PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '',                                                priority: PRIORITY.home,      changeFrequency: CHANGEFREQ.weekly },
  { path: '/services',                                       priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
  { path: '/projects',                                       priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
  { path: '/blog',                                           priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
  { path: '/areas',                                          priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides',                                         priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
  { path: '/about',                                          priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/design',                                         priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.monthly },
  { path: '/features',                                       priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/contact',                                        priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
  { path: '/workflow',                                       priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
  { path: '/showroom',                                       priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/reviews',                                        priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
  { path: '/guides/kitchen-renovation-cost-vancouver',       priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides/bathroom-renovation-cost-vancouver',      priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides/whole-house-renovation-cost-vancouver',   priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides/basement-renovation-cost-vancouver',      priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides/commercial-renovation-cost-vancouver',    priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides/cabinet-refinishing-cost-vancouver',      priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/guides/basement-suite-cost-vancouver',           priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
  { path: '/financing',                                      priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
  { path: '/transparent-pricing',                            priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
  // /awards/ ships as an EMPTY archive and is `robots: noindex` until it has
  // a real entry (lib/awards.ts). Submitting a noindex URL in a sitemap is a
  // contradiction Search Console reports as an error, so it stays out until
  // HAS_AWARDS flips — then it appears here for all 14 locales automatically.
  ...(HAS_AWARDS
    ? [{ path: '/awards', priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly }]
    : []),
  { path: '/careers',                                        priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  // High-intent "near me" landing pages — full metadata + Service/FAQ schema,
  // indexable, but were absent from the sitemap (crawlers found them via
  // internal links only).
  { path: '/renovation-near-me',                             priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/kitchen-renovation-near-me',                     priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/bathroom-renovation-near-me',                    priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/basement-renovation-near-me',                    priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/whole-house-renovation-near-me',                 priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
  { path: '/before-after',                                   priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.monthly },
  { path: '/privacy',                                        priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
  { path: '/terms',                                          priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
];

export const COST_GUIDE_BLOG_SLUGS = new Set([
  'vanity-renovation-cost-vancouver',
  'bathtub-renovation-cost-vancouver',
  'toilet-renovation-cost-vancouver',
  'average-bathroom-renovation-cost-vancouver',
  'basement-renovation-vancouver-complete-guide',
  // Cabinet refinishing city cost guides — same topic-cluster role as /guides/ pages.
  // Added 2026-06-26: elevated sitemap priority so Googlebot crawls on the same
  // monthly cadence as /guides/ pages instead of the default blog 0.65 tier.
  'cabinet-refinishing-burnaby-cost-guide',
  'cabinet-refinishing-coquitlam-cost-guide',
  'cabinet-refinishing-delta-cost-guide',
  'cabinet-refinishing-maple-ridge-cost-guide',
  'cabinet-refinishing-new-westminster-cost-guide',
  'cabinet-refinishing-north-vancouver-cost-guide',
  'cabinet-refinishing-port-coquitlam-cost-guide',
  'cabinet-refinishing-richmond-cost-guide',
  'cabinet-refinishing-surrey-cost-guide',
  'cabinet-refinishing-vancouver-cost-guide',
  'cabinet-refinishing-west-vancouver-cost-guide',
  'cabinet-refinishing-white-rock-cost-guide',
  'cabinet-resurfacing-langley-cost-guide',
  'cabinet-resurfacing-port-moody-cost-guide',
  // Pre-sale renovation city guides — high commercial intent.
  'pre-sale-renovation-burnaby-bc-2026',
  'pre-sale-renovation-coquitlam-bc-2026',
  'pre-sale-renovation-delta-bc-2026',
  'pre-sale-renovation-langley-bc-2026',
  'pre-sale-renovation-maple-ridge-bc-2026',
  'pre-sale-renovation-new-westminster-bc-2026',
  'pre-sale-renovation-north-vancouver-bc-2026',
  'pre-sale-renovation-port-coquitlam-bc-2026',
  'pre-sale-renovation-port-moody-bc-2026',
  'pre-sale-renovation-richmond-bc-2026',
  'pre-sale-renovation-surrey-bc-2026',
  'pre-sale-renovation-vancouver-what-to-fix-before-listing',
  'pre-sale-renovation-west-vancouver-bc-2026',
  'pre-sale-renovation-white-rock-bc-2026',
  // Main guide hub blog posts — high-equity reference content.
  'how-to-choose-renovation-contractor-vancouver',
  // NOTE: 'renovation-cost-vancouver-2026-complete-guide' removed 2026-06-26 —
  // next.config.ts 308-redirects it to /guides/whole-house-renovation-cost-vancouver/,
  // so listing it here put a redirecting URL in the sitemap ("Incorrect pages
  // found in sitemap.xml"). The destination guide is indexed on its own.
  'renovation-timeline-how-long-does-each-project-take',
  'renovation-permits-bc-guide',
  'renovation-financing-vancouver-heloc',
  'strata-renovation-rules-vancouver',
  // Home renovation city guides — high commercial intent, broad area coverage.
  // Added 2026-06-26: each guide covers costs, permits, and neighbourhoods for
  // a specific Metro Vancouver city — same topical authority tier as pre-sale guides.
  'burnaby-home-renovation-guide-2026',
  'burnaby-renovation-cost-guide-2026',
  'coquitlam-home-renovation-guide-2026',
  'delta-home-renovation-guide-2026',
  'langley-home-renovation-guide-2026',
  'maple-ridge-home-renovation-guide-2026',
  'new-westminster-home-renovation-guide-2026',
  'north-vancouver-home-renovation-guide-2026',
  'port-coquitlam-home-renovation-guide-2026',
  'port-moody-home-renovation-guide-2026',
  'richmond-home-renovation-guide-2026',
  'surrey-home-renovation-guide-2026',
  'vancouver-home-renovation-guide-2026',
  'west-vancouver-home-renovation-guide-2026',
  'white-rock-home-renovation-guide-2026',
  // Fixture cost guides — specialized cost research posts.
  'shower-renovation-cost-vancouver-2026',
  // Kitchen renovation city guides — high commercial intent per-city content.
  // Added 2026-06-26: match the home-renovation-guide tier elevation.
  'kitchen-renovation-burnaby-2026',
  'kitchen-renovation-coquitlam-bc-2026',
  'kitchen-renovation-delta-bc-2026',
  'kitchen-renovation-langley-bc-2026',
  'kitchen-renovation-maple-ridge-bc-2026',
  'kitchen-renovation-new-westminster-bc-2026',
  'kitchen-renovation-north-vancouver-2026',
  'kitchen-renovation-port-coquitlam-bc-2026',
  'kitchen-renovation-port-moody-bc-2026',
  'kitchen-renovation-richmond-bc-2026',
  'kitchen-renovation-surrey-bc-2026',
  'kitchen-renovation-vancouver-bc-2026',
  'kitchen-renovation-west-vancouver-2026',
  'kitchen-renovation-white-rock-2026',
  // Bathroom renovation city guides.
  'bathroom-renovation-coquitlam-bc-2026',
  'bathroom-renovation-cost-richmond-bc-2026',
  'bathroom-renovation-delta-bc-2026',
  'bathroom-renovation-langley-2026',
  'bathroom-renovation-maple-ridge-bc-2026',
  'bathroom-renovation-new-westminster-2026',
  'bathroom-renovation-port-coquitlam-2026',
  'bathroom-renovation-port-moody-2026',
  'bathroom-renovation-surrey-bc-2026',
  'burnaby-bathroom-renovation-guide-2026',
  // Kitchen + bathroom combo city guides.
  'kitchen-bathroom-renovation-maple-ridge-2026',
  'kitchen-bathroom-renovation-new-westminster-2026',
  'kitchen-bathroom-renovation-port-coquitlam-2026',
  'kitchen-bathroom-renovation-port-moody-2026',
  // Basement renovation city guides.
  'basement-renovation-delta-bc',
  'basement-renovation-new-westminster-2026',
  'basement-renovation-richmond-bc-2026',
  'basement-renovation-west-vancouver-2026',
  'basement-renovation-white-rock-2026',
  'basement-renovations-burnaby-2026',
  'basement-renovations-coquitlam-2026',
  'basement-renovations-port-coquitlam-2026',
  // Condo renovation city guides.
  'condo-renovation-delta-bc-2026',
  'condo-renovation-new-westminster-2026',
  'condo-renovation-north-vancouver-2026',
  'condo-renovation-surrey-bc-2026',
  // Additional cost/renovation guides — elevated to guide tier 2026-06-26.
  // Fixture + room-specific cost posts, aging-in-place guides, and comparison
  // posts share the same topical-authority role as the /guides/ pages.
  '3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026',
  'aging-in-place-bathroom-renovation-vancouver-2026',
  'aging-in-place-renovation-guide-bc',
  'basement-renovation-cost-vancouver-2026',
  'basement-suite-renovation-cost-vancouver',
  'bathroom-renovation-cost-vancouver-by-size',
  'bathroom-renovation-cost-vancouver-by-style',
  'condo-vs-house-renovation-cost-vancouver',
  'hardwood-flooring-vancouver-installation-cost-2026',
  'kitchen-backsplash-cost-vancouver-2026',
  'laundry-room-renovation-cost-vancouver-2026',
  'powder-room-renovation-vancouver-cost-design-2026',
  'restaurant-renovation-cost-vancouver',
  'townhouse-renovation-cost-vancouver-2026',
  'vancouver-infill-development-cost-2026',
  'vancouver-multiplex-laneway-renovation-guide-2026',
  // Planning and ideas guides for bathroom and basement.
  'basement-renovation-financing-bc-guide',
  'bathroom-renovation-planning-guide-vancouver',
  'small-bathroom-renovation-ideas-vancouver-condos-2026',
  // Remaining basement renovation city guides.
  'basement-renovations-langley',
  'basement-renovations-maple-ridge',
  'basement-renovations-north-vancouver',
  'basement-renovations-port-moody',
  'basement-renovations-surrey',
  // Bathroom renovation city guides not previously captured.
  'bathroom-renovations-north-vancouver-2026',
  'bathroom-renovations-west-vancouver-2026',
  'bathroom-renovations-white-rock-bc-2026',
  // Comparison/decision guides — same topical-authority role as /guides/ pages.
  'kitchen-vs-bathroom-which-renovation-first-vancouver',
  // Property-type and specialty renovation guides — evergreen reference content.
  'adu-renovation-vancouver-2026',
  'condo-kitchen-renovation-vancouver-space-saving-ideas',
  'diy-vs-contractor-renovation-vancouver-2026',
  'duplex-renovation-vancouver-costs-permits-2026',
  'heritage-home-renovation-vancouver-2026',
  'kitchen-layout-planning-vancouver-2026',
  'multi-generational-home-renovation-vancouver-2026',
  'open-concept-kitchen-vancouver-load-bearing-wall-cost',
  'renovation-insurance-guide-bc',
  'split-level-home-renovation-burnaby-coquitlam-2026',
  'surrey-renovation-permits-guide-2026',
  'vancouver-renovation-tax-credits-rebates-2026',
  'whole-house-renovation-white-rock-2026',
  // Additional posts elevated 2026-06-26 — all have 8+ inbound links from
  // cross-linking work this session and warrant guide-tier sitemap priority.
  'best-time-to-renovate-in-vancouver',
  'kitchen-design-trends-vancouver-2026',
  'pre-1980-home-renovation-vancouver-what-to-expect',
  'kitchen-cabinet-colour-timeless-vancouver',
  'glass-shower-doors-vancouver-frameless-semi-frameless-sliding',
  'renovate-vs-move-vancouver-2026',
  'best-kitchen-cabinets-vancouver-stock-vs-custom-2026',
  'rental-property-renovation-vancouver-roi',
  'office-renovation-vancouver-tenant-improvements-2026',
  'kitchen-lighting-design-vancouver-2026',
  'ikea-sektion-vs-custom-kitchen-cabinets-vancouver-2026',
  'how-to-read-renovation-quote-line-items',
  'hardwood-vs-laminate-vs-lvp-flooring-vancouver-comparison',
  'apartment-building-renovation-vancouver-2026',
  'update-kitchen-without-full-renovation-under-15k-vancouver',
  'tub-vs-shower-vancouver-which-adds-more-value',
  'spring-renovation-checklist-vancouver-2026',
  'quartz-vs-granite-countertops-vancouver-2026',
  'mid-century-rancher-renovation-vancouver-2026',
  'kitchen-refresh-without-full-renovation-vancouver-2026',
  'best-flooring-options-vancouver-2026',
  'best-bathroom-tiles-vancouver-2026',
  'bathroom-refresh-without-full-renovation-vancouver-2026',
  // Elevated 2026-06-26 tick 637 — all reached 8+ inbound links
  '3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026',
  'range-hood-install-vancouver-2026',
  'summer-renovation-vancouver-2026-best-projects',
  'vancouver-renovation-before-after-10-projects',
  'langley-kitchen-renovation-waterfall-island',
  'two-bathroom-renovation-with-brushed-gold-fixtures',
  // Elevated 2026-06-26 tick 637 (batch 2) — showcase posts that reached 8+ inbound
  'budget-friendly-kitchen-renovation-in-coquitlam',
  'burnaby-bathroom-renovation-success',
  'commercial-warehouse-door-renovation-burnaby',
  'comprehensive-kitchen-renovation-surrey',
  'custom-whole-house-renovation-in-vancouver',
  'daughters-bathroom-renovation-with-gray-tiles-and-black-fixtures',
  'dual-bathroom-renovation-with-unique-powder-room',
  'exotic-style-kitchen-renovation-with-waterfall-island',
  'modern-kitchen-renovation-with-custom-cabinets-surrey',
  'stylish-kitchen-renovation-with-white-cabinets-and-gold-handles',
  'transforming-one-bathroom-into-two-stylish-spaces',
  'two-bathroom-renovation-with-arched-doors-richmond',
]);
