/**
 * Cost-guide blog → cost-guide page consolidation — the ONE list.
 *
 * Per SEO audit (May 2026, GSC top-pages report): the DB-driven
 * /blog/<topic>-cost-vancouver/ posts and the static
 * /guides/<topic>-cost-vancouver/ pages cover the same intent and were
 * competing for the same query clusters. The /guides/* version consistently
 * outranks the blog version, so the blog versions are permanently redirected
 * into the guides to consolidate link equity and stop Google from picking the
 * wrong canonical.
 *
 * Read by BOTH:
 *   - next.config.ts `redirects()` — section 9b1, one rule per pair below;
 *   - lib/sitemap/sections.ts — the `blog` section skips these slugs, because a
 *     sitemap must not list URLs that answer with a redirect (DI-18,
 *     2026-11-24: 82 such URLs were being submitted).
 * Add or remove a pair HERE and both follow; they cannot drift.
 *
 * Blog posts on cost-vancouver topics with no matching /guides/ page (bathtub,
 * toilet, vanity, kitchen-backsplash, laundry-room, townhouse, condo-vs-house,
 * restaurant, 3-piece-vs-4-piece) are intentionally NOT redirected — they hold
 * their own keyword niches and there is no guide to consolidate into.
 *
 * Kept dependency-free (no `@/` imports): next.config.ts loads it directly.
 */
export const BLOG_TO_GUIDE_REDIRECTS: ReadonlyArray<{ readonly blogSlug: string; readonly guideSlug: string }> = [
  { blogSlug: 'average-bathroom-renovation-cost-vancouver', guideSlug: 'bathroom-renovation-cost-vancouver' },
  { blogSlug: 'basement-renovation-cost-vancouver-2026', guideSlug: 'basement-renovation-cost-vancouver' },
  { blogSlug: 'basement-suite-renovation-cost-vancouver', guideSlug: 'basement-suite-cost-vancouver' },
  { blogSlug: 'basement-suite-renovation-cost-vancouver-zh', guideSlug: 'basement-suite-cost-vancouver' },
  { blogSlug: 'bathroom-renovation-cost-vancouver-by-size', guideSlug: 'bathroom-renovation-cost-vancouver' },
  { blogSlug: 'bathroom-renovation-cost-vancouver-by-style', guideSlug: 'bathroom-renovation-cost-vancouver' },
  { blogSlug: 'renovation-cost-vancouver-2026-complete-guide', guideSlug: 'whole-house-renovation-cost-vancouver' },
];

/** Blog slugs that redirect to a /guides/ page — excluded from the sitemap. */
export const BLOG_SLUGS_REDIRECTED_TO_GUIDES: ReadonlySet<string> = new Set(
  BLOG_TO_GUIDE_REDIRECTS.map((r) => r.blogSlug),
);

/**
 * The next.config.ts redirect rules for the pairs above. `localeMatcher` is the
 * `:locale(...)` alternation next.config.ts already uses, so the emitted rules
 * are byte-identical to the hand-written ones they replace.
 */
export function blogToGuideRedirectRules(localeMatcher: string) {
  return BLOG_TO_GUIDE_REDIRECTS.map(({ blogSlug, guideSlug }) => ({
    source: `/:locale(${localeMatcher})/blog/${blogSlug}`,
    destination: `/:locale/guides/${guideSlug}/`,
    permanent: true as const,
  }));
}
