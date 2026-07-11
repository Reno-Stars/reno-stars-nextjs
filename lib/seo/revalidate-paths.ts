/**
 * Shared on-demand revalidation helper for admin server actions.
 *
 * Context: admin content edits used to fire `triggerDeploy()` (a full Vercel
 * rebuild that wipes the entire ISR cache and forces ~13k non-EN pages to
 * regenerate on the next crawl — the dominant driver of the ISR-write bill).
 * That sledgehammer was replaced with targeted on-demand revalidation: an edit
 * revalidates only the pages it actually touched.
 *
 * Every URL on the site is locale-prefixed (`/en/...`, `/zh/...`, ...), so a
 * single logical page (e.g. one project) maps to one path per locale. This
 * helper revalidates the same relative path across every locale at once,
 * mirroring the all-locale path logic already proven in
 * `app/api/revalidate/route.ts` and `lib/seo/blog-revalidate.ts`.
 */
import { revalidatePath, updateTag } from 'next/cache';
import { locales } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { purgeCloudflareUrls, purgeCloudflareEverything } from '@/lib/cloudflare-purge';

/** Revalidate the same relative path across every locale, e.g. `/projects/${slug}`. */
export function revalidatePathAllLocales(relPath: string): void {
  for (const loc of locales) revalidatePath(`/${loc}${relPath}`);
  // Purge the same URLs from the Cloudflare edge (no-op without a CF token) so
  // the edit is visible immediately, not after the ≤5min s-maxage window.
  const base = getBaseUrl();
  void purgeCloudflareUrls(locales.map((loc) => `${base}/${loc}${relPath}/`));
}

/**
 * Bust every DATA-CACHE tag that a project create/update/delete affects.
 * Projects appear on more surfaces than the detail page + listing: the area
 * pages (`projects:by-area`) and the cost-guide pages (`projects:by-guide`)
 * both read cached project sets that go stale for 24h otherwise — a deleted
 * or re-scoped project keeps showing (dead card / wrong city) until the TTL.
 * The verified-review caches (`reviews:by-area`, `reviews:by-service`,
 * `reviews:hub`) JOIN projects for isPublished / locationCity / serviceType /
 * slug, so a delete, unpublish, re-city, re-type or slug rename also changes
 * which review cards render where (and where their "See this project" links
 * point) — bust them together, mirroring revalidateReviewSurfaces() on the
 * review-mutation side. (`reviews:by-service` also covers the force-dynamic
 * /services/<type>/ pages' data reads; their edge-cached HTML self-heals
 * within the s-maxage=300 window, same trade-off as the area detail pages.)
 * Call this from every project mutation so all its surfaces refresh together.
 */
export function revalidateProjectSurfaces(): void {
  updateTag('projects:listing');
  updateTag('sites:listing');
  updateTag('projects:by-area');
  updateTag('projects:by-guide');
  updateTag('reviews:by-area');
  updateTag('reviews:by-service');
  updateTag('reviews:hub');
  // Projects surface on the /projects listing, /areas/*, /guides/* and
  // /reviews pages. Purge those index/hub URLs at the edge (the detail page
  // is purged separately via revalidatePathAllLocales). No-op without a CF token.
  const base = getBaseUrl();
  const hubs = ['/projects/', '/areas/', '/guides/', '/reviews/'];
  void purgeCloudflareUrls(locales.flatMap((loc) => hubs.map((h) => `${base}/${loc}${h}`)));
}

/**
 * Bust the site-wide GLOBALS: the header/footer/nav (company NAP, social
 * icons, service + area menus — all tagged `nav:globals`) AND the AI-facing
 * generated docs (/llms.txt, /llms-full.txt aggregate company facts, the area
 * list and social profiles). Any admin edit to company / social links /
 * services / service areas must call this, else the header/footer serve stale
 * NAP and the llms docs feed crawlers stale facts for up to their TTL.
 */
/**
 * SSOT for "a homepage/section content tag changed": bust the origin data-cache
 * tag AND purge the edge pages it surfaces on, in ONE call. Bundling them means
 * a mutating admin action can't refresh the origin while forgetting the edge
 * (the drift that left FAQ/partners/design edits stale at the edge for ≤5min).
 * `purgePages` are locale-relative paths ('/' = home), purged across all locales.
 */
export function revalidateContentTag(tag: string, purgePages: string[]): void {
  updateTag(tag);
  purgeCloudflarePagesAllLocales(purgePages);
}

/**
 * Purge specific relative paths from the Cloudflare edge across every locale
 * (no-op without a CF token). For admin actions that updateTag() homepage /
 * about / design content — those tag busts refresh the ORIGIN but leave the
 * edge-cached HTML stale for ≤5min otherwise. `relPath` '/' means the locale
 * home (e.g. /en/). Fire-and-forget.
 */
export function purgeCloudflarePagesAllLocales(relPaths: string[]): void {
  const base = getBaseUrl();
  const urls = locales.flatMap((loc) =>
    relPaths.map((rel) => `${base}/${loc}${rel === '/' ? '/' : rel}`),
  );
  void purgeCloudflareUrls(urls);
}

export function revalidateGlobals(): void {
  updateTag('nav:globals');
  revalidatePath('/llms.txt');
  revalidatePath('/llms-full.txt');
  // The header/footer nav is on EVERY page, so a globals edit invalidates the
  // whole edge cache. These edits are rare (company NAP / social / menus), so a
  // full zone purge is the correct, simplest choice. No-op without a CF token.
  void purgeCloudflareEverything();
}
