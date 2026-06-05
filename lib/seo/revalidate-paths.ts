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
import { revalidatePath } from 'next/cache';
import { locales } from '@/i18n/config';

/** Revalidate the same relative path across every locale, e.g. `/projects/${slug}`. */
export function revalidatePathAllLocales(relPath: string): void {
  for (const loc of locales) revalidatePath(`/${loc}${relPath}`);
}

/**
 * Revalidate several relative paths across every locale.
 *
 * Use this in admin server actions INSTEAD of `updateTag(...)`: on this Next 16 /
 * Vercel setup tag revalidation OVER-INVALIDATES (busting one tag regenerates
 * unrelated pages — ~a full-cache wipe), whereas `revalidatePath` is surgical.
 * So name the exact pages an edit touches (its detail page + the listing
 * index/feature page); footer/global blocks and long-tail cross-links refresh on
 * their own ISR TTL (≤24h, approved) rather than being force-regenerated. Empty
 * / falsy entries are skipped so callers can pass conditional paths inline.
 */
export function revalidatePathsAllLocales(...relPaths: Array<string | null | undefined | false>): void {
  for (const rel of relPaths) {
    if (rel) for (const loc of locales) revalidatePath(`/${loc}${rel}`);
  }
}
