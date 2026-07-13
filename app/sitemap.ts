import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getBaseUrl, LOCALE_TO_DB_SUFFIX } from '@/lib/utils';
import { resolveBlogDates } from '@/lib/blog-dates';
import { getProjectSlugsFromDb, getSiteSlugsFromDb, getBlogPostSlugsFromDb, getServiceAreasFromDb, getCategorySlugs, getServicesFromDb, getVideoWatchEntriesFromDb } from '@/lib/db/queries';

// Render per-request so a freshly published blog/project/area appears in the
// sitemap IMMEDIATELY. The old `revalidate = 604800` (168h ISR) only ever
// existed to dodge Vercel ISR-WRITE billing — which no longer applies now that
// the site is self-hosted. Worse, that metadata-route ISR entry could NOT be
// busted on demand (verified 2026-07-03: neither revalidatePath('/sitemap.xml')
// nor cache-tag propagation invalidates it), so new content sat out of the
// sitemap for up to a week. `force-dynamic` + the UNCACHED slug queries this
// reads (getBlogPostSlugsFromDb etc.) mean the sitemap always mirrors the DB:
// published content can never silently drop out behind a stale cache, and new
// content needs no revalidation to appear. Sitemap traffic is crawler-only and
// low-volume, so the per-request DB reads are negligible.
export const dynamic = 'force-dynamic';

const BASE_URL = getBaseUrl();

/**
 * Build a per-page lastmod from DB row timestamps + priority/changefreq
 * buckets. Google states they ignore priority/changefreq (per public docs)
 * but Bing, Yandex, and DuckDuckGo do use them. Cost is zero, signal is
 * real for non-Google search engines and crawl-budget heuristics.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const [projectRows, siteRows, blogPostRows, serviceAreas, categorySlugs, allServices, videoEntries] = await Promise.all([
    getProjectSlugsFromDb(),
    getSiteSlugsFromDb(),
    getBlogPostSlugsFromDb(),
    getServiceAreasFromDb(),
    getCategorySlugs(),
    getServicesFromDb(),
    getVideoWatchEntriesFromDb(),
  ]);
  const projectDateMap = new Map(projectRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const siteDateMap = new Map(siteRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  // Blog <lastmod> runs the SAME honest-dates gate as the page's BlogPosting
  // JSON-LD (lib/blog-dates.ts): a genuine admin content edit (content_updated_at
  // meaningfully after publication) → that edit date; otherwise → the published
  // date. Raw updated_at here previously advertised bulk-script stamps (29 posts
  // shared one 2026-07-10 stamp) as freshness while the pages themselves omitted
  // dateModified — contradictory signals to Google on the same URLs (2026-07-13
  // review finding). content_updated_at is a plain column read, so this no longer
  // costs the O(n^2) cluster subquery it used to (finding #28).
  const blogDateMap = new Map(blogPostRows.map(r => {
    const { datePublished, dateModified } = resolveBlogDates({
      published_at: r.publishedAt,
      created_at: r.createdAt,
      content_updated_at: r.contentUpdatedAt,
    });
    return [r.slug, dateModified ?? datePublished ?? now];
  }));

  // Image-URL maps for image-sitemap support. Next.js MetadataRoute.Sitemap
  // accepts an `images: string[]` field per entry — the renderer adds the
  // `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` namespace
  // and emits `<image:image><image:loc>URL</image:loc></image:image>` per
  // image. Lifts image-search traffic (Google Images, Bing Visual Search)
  // for renovation project galleries + blog hero images + service-area
  // city photos. Verified Next.js sitemap renderer supports this at
  // node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js:109.
  const projectImageMap = new Map(projectRows.filter(r => r.heroImageUrl).map(r => [r.slug, r.heroImageUrl!]));
  const siteImageMap = new Map(siteRows.filter(r => r.heroImageUrl).map(r => [r.slug, r.heroImageUrl!]));
  const blogImageMap = new Map(blogPostRows.filter(r => r.featuredImageUrl).map(r => [r.slug, r.featuredImageUrl!]));
  const projectSlugs = projectRows.map(r => r.slug);
  const siteSlugs = siteRows.map(r => r.slug);
  const blogPostSlugs = blogPostRows.map(r => r.slug);
  const serviceSlugs = allServices.filter(s => s.showOnServicesPage !== false).map(s => s.slug);

  // Use the latest DB timestamp as the lastmod for static pages — gives Google
  // a real "site updated" signal that moves when content changes.
  const allDates = [
    ...Array.from(projectDateMap.values()),
    ...Array.from(siteDateMap.values()),
    ...Array.from(blogDateMap.values()),
  ];
  const staticLastModified = allDates.length > 0
    ? allDates.sort().slice(-1)[0]
    : now;

  // Per-area lastmod: latest project updatedAt where the project's location
  // matches the area name. Falls back to staticLastModified for areas with
  // no completed projects yet.
  const areaLastModMap = new Map<string, string>();
  for (const area of serviceAreas) {
    const cityName = area.name.en.toLowerCase();
    const latestProjectDate = projectRows
      .filter(p => p.locationCity?.toLowerCase() === cityName)
      .map(p => p.updatedAt?.toISOString() ?? '')
      .filter(Boolean)
      .sort()
      .slice(-1)[0];
    areaLastModMap.set(area.slug, latestProjectDate || staticLastModified);
  }

  const entries: MetadataRoute.Sitemap = [];

  // Priority buckets — see comment at top of file. Cost zero, signal real for non-Google.
  const PRIORITY = {
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
  const CHANGEFREQ = {
    weekly: 'weekly' as const,
    monthly: 'monthly' as const,
    yearly: 'yearly' as const,
  };

  const staticPages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
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

  // Generate hreflang alternates for every supported locale. Driven by
  // i18n/config.ts locales array so adding a new locale automatically
  // expands the sitemap without further edits here.
  const buildAlternates = (path: string, includeLocales: readonly string[] = locales) => {
    const languages: Record<string, string> = {};
    for (const loc of includeLocales) {
      languages[loc] = `${BASE_URL}/${loc}${path}/`;
    }
    languages['x-default'] = `${BASE_URL}/en${path}/`;
    return { languages };
  };

  for (const { path, priority, changeFrequency } of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(path),
        priority,
        changeFrequency,
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/services/${slug}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/services/${slug}`),
        priority: PRIORITY.serviceLeaf,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  // Drop minor-locale × service × city — duplicate-by-content per GSC
  // 2026-05-07 audit; only EN+ZH have organic traffic on these long-tail
  // combos. Other 12 locales were emitting ~3,400 thin templated pages
  // (514 stuck in "Crawled - currently not indexed") that diluted crawl
  // budget away from EN/ZH winners.
  const SERVICE_CITY_LOCALES = ['en', 'zh'] as const;
  for (const slug of serviceSlugs) {
    for (const area of serviceAreas) {
      for (const locale of SERVICE_CITY_LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
          lastModified: areaLastModMap.get(area.slug) ?? staticLastModified,
          alternates: buildAlternates(`/services/${slug}/${area.slug}`),
          priority: PRIORITY.serviceArea,
          changeFrequency: CHANGEFREQ.monthly,
        });
      }
    }
  }

  for (const category of categorySlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${category}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/projects/${category}`),
        priority: PRIORITY.hub,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  // Budget-tier filter pages — programmatic, catch budget-intent queries
  // ("affordable kitchen reno vancouver", "high end renovation vancouver").
  for (const tier of ['under-30k', '30k-60k', '60k-plus']) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/budget/${tier}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/projects/budget/${tier}`),
        priority: PRIORITY.guide,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  // Drop minor-locale × projects/[slug] — same rationale as service×city:
  // duplicate-by-content per GSC 2026-05-07 audit; only EN+ZH have organic
  // traffic on these long-tail combos.
  const PROJECT_LEAF_LOCALES = ['en', 'zh'] as const;
  const categorySet = new Set(categorySlugs);
  for (const slug of projectSlugs.filter(s => !categorySet.has(s))) {
    const projectImage = projectImageMap.get(slug);
    for (const locale of PROJECT_LEAF_LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: projectDateMap.get(slug) ?? now,
        alternates: buildAlternates(`/projects/${slug}`),
        priority: PRIORITY.projectLeaf,
        changeFrequency: CHANGEFREQ.yearly,
        ...(projectImage && { images: [projectImage] }),
      });
    }
  }

  const projectSlugSet = new Set(projectSlugs);
  for (const slug of siteSlugs.filter(s => !projectSlugSet.has(s))) {
    const siteImage = siteImageMap.get(slug);
    for (const locale of PROJECT_LEAF_LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: siteDateMap.get(slug) ?? now,
        alternates: buildAlternates(`/projects/${slug}`),
        priority: PRIORITY.projectLeaf,
        changeFrequency: CHANGEFREQ.yearly,
        ...(siteImage && { images: [siteImage] }),
      });
    }
  }

  // Cost-guide blog posts share the topic-cluster role of the /guides/{slug}
  // pages — they're permanent reference content, not time-sensitive blog. Bump
  // them to PRIORITY.guide so Google crawls them on the same cadence.
  const COST_GUIDE_BLOG_SLUGS = new Set([
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

  // Blog × locale: only submit locales that have a NATIVE body. Untranslated
  // minor-locale variants render with an EN fallback body and carry
  // `robots: noindex` (app/[locale]/blog/[slug]/page.tsx) — submitting them in
  // the sitemap is a contradictory signal Google flags as "Excluded by
  // 'noindex' tag" (793 URLs, GSC 2026-07-07) and wastes crawl budget. Each
  // locale URL (and its hreflang alternates) appears here automatically once
  // its translation lands in the localizations jsonb.
  const nativeKeysBySlug = new Map(blogPostRows.map(r => [r.slug, new Set(r.nativeContentKeys ?? [])]));
  for (const slug of blogPostSlugs) {
    const isCostGuide = COST_GUIDE_BLOG_SLUGS.has(slug);
    const blogImage = blogImageMap.get(slug);
    const nativeKeys = nativeKeysBySlug.get(slug) ?? new Set<string>();
    const nativeLocales = locales.filter(loc => {
      if (loc === 'en' || loc === 'zh') return true;
      const suffix = LOCALE_TO_DB_SUFFIX[loc];
      return suffix ? nativeKeys.has(`content${suffix}`) : false;
    });
    const alternates = buildAlternates(`/blog/${slug}`, nativeLocales);
    for (const locale of nativeLocales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}/`,
        lastModified: blogDateMap.get(slug) ?? now,
        alternates,
        priority: isCostGuide ? PRIORITY.guide : PRIORITY.blog,
        changeFrequency: CHANGEFREQ.monthly,
        ...(blogImage && { images: [blogImage] }),
      });
    }
  }

  for (const area of serviceAreas) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/areas/${area.slug}/`,
        lastModified: areaLastModMap.get(area.slug) ?? staticLastModified,
        alternates: buildAlternates(`/areas/${area.slug}`),
        priority: PRIORITY.area,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  // Video WATCH pages (/videos/[slug]/) — EN+ZH like project leaves. The
  // `videos` field renders <video:video> sitemap tags (title, thumbnail,
  // description), which Google requires alongside the VideoObject JSON-LD
  // on the page for video indexing. DB-driven: a new project hero video
  // (+ thumbnail) adds its watch page here automatically.
  for (const v of videoEntries) {
    if (!v.thumbnailUrl) continue;
    for (const locale of PROJECT_LEAF_LOCALES) {
      const isZh = locale === 'zh';
      entries.push({
        url: `${BASE_URL}/${locale}/videos/${v.slug}/`,
        lastModified: (v.updatedAt ?? new Date()).toISOString(),
        alternates: buildAlternates(`/videos/${v.slug}`, [...PROJECT_LEAF_LOCALES]),
        priority: PRIORITY.projectLeaf,
        changeFrequency: CHANGEFREQ.yearly,
        videos: [{
          title: isZh ? `${v.titleZh}——装修实拍视频` : `${v.titleEn} — Renovation Video Tour`,
          thumbnail_loc: v.thumbnailUrl,
          description: (isZh ? v.descriptionZh : v.descriptionEn) || (isZh ? v.titleZh : v.titleEn),
          content_loc: v.videoUrl,
          publication_date: (v.uploadDate ?? new Date()).toISOString(),
        }],
      });
    }
  }

  return entries;
}
