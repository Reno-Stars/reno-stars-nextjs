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
