/**
 * The 3 budget-tier landing pages (/{locale}/projects/budget/{tier}/) were
 * retired with the project-area price removal (Ryan 11-24): their titles,
 * H1s and grids were all price bands. Each of the 14 locales' 3 pages 301s to
 * that locale's /projects/ listing. Resolved in proxy.ts so the status is a
 * true 301 (next.config `permanent` redirects answer 308).
 */
import { locales } from '@/i18n/config';

export const RETIRED_BUDGET_TIERS = ['under-30k', '30k-60k', '60k-plus'] as const;

const PATTERN = new RegExp(
  `^/(${locales.map((l) => l.replace('-', '\\-')).join('|')})/projects/budget/(${RETIRED_BUDGET_TIERS.join('|')})/?$`,
);

/** `/{locale}/projects/` for a retired budget page path, else null. */
export function retiredBudgetRedirectPath(pathname: string): string | null {
  const m = PATTERN.exec(pathname);
  return m ? `/${m[1]}/projects/` : null;
}
