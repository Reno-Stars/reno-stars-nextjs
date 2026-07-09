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

/** Revalidate the same relative path across every locale, e.g. `/projects/${slug}`. */
export function revalidatePathAllLocales(relPath: string): void {
  for (const loc of locales) revalidatePath(`/${loc}${relPath}`);
}

/**
 * Bust every DATA-CACHE tag that a project create/update/delete affects.
 * Projects appear on more surfaces than the detail page + listing: the area
 * pages (`projects:by-area`) and the cost-guide pages (`projects:by-guide`)
 * both read cached project sets that go stale for 24h otherwise — a deleted
 * or re-scoped project keeps showing (dead card / wrong city) until the TTL.
 * Call this from every project mutation so all its surfaces refresh together.
 */
export function revalidateProjectSurfaces(): void {
  updateTag('projects:listing');
  updateTag('sites:listing');
  updateTag('projects:by-area');
  updateTag('projects:by-guide');
}

/**
 * Bust the site-wide GLOBALS: the header/footer/nav (company NAP, social
 * icons, service + area menus — all tagged `nav:globals`) AND the AI-facing
 * generated docs (/llms.txt, /llms-full.txt aggregate company facts, the area
 * list and social profiles). Any admin edit to company / social links /
 * services / service areas must call this, else the header/footer serve stale
 * NAP and the llms docs feed crawlers stale facts for up to their TTL.
 */
export function revalidateGlobals(): void {
  updateTag('nav:globals');
  revalidatePath('/llms.txt');
  revalidatePath('/llms-full.txt');
}
