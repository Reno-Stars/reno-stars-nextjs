import { mapMeta, type Locale } from '@/i18n/config';
import type { PlatformId } from './types';

/**
 * Who sees which platforms, and in what order. Derived from
 * LOCALE_META.shareTargets in i18n/config.ts — edit the rows there; the
 * rationale for each audience's row lives with it.
 *
 * Spread into a mutable array: the table's rows are `readonly PlatformId[]`
 * and this export's existing type is not, so callers keep the type they had.
 */
export const LOCALE_TARGETS: Record<Locale, PlatformId[]> = mapMeta(
  (m) => [...m.shareTargets],
);

/** Appended to every locale, in this order, after that locale's own targets.
 *  `native` last because it is the catch-all that reaches everything else. */
export const UNIVERSAL_TAIL: PlatformId[] = ['email', 'copy', 'native'];

/** How many buttons render before the "More" disclosure. resolveTargets returns
 *  the full list regardless — this only governs what is visible, so coverage
 *  can be comprehensive without the UI becoming a wall of buttons. */
export const VISIBLE_CAP = { desktop: 8, mobile: 5 } as const;
