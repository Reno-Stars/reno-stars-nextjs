import type { Locale } from '@/i18n/config';
import { LOCALE_TARGETS, UNIVERSAL_TAIL, VISIBLE_CAP } from './matrix';
import { PLATFORMS } from './platforms';
import type { ShareContext, ShareEnv, ShareTarget } from './types';

/**
 * The locale's targets plus the universal tail, dropped through each platform's
 * `enabled` guard. Pure — no DOM, no React, no I/O. Order is the matrix order.
 *
 * Returns the FULL list. Deciding what's visible is the layout's job
 * (`splitVisible`), which is what lets coverage be comprehensive without the UI
 * being a wall of buttons.
 */
export function resolveTargets(
  locale: Locale,
  ctx: ShareContext,
  env: ShareEnv,
): ShareTarget[] {
  const ids = [...(LOCALE_TARGETS[locale] ?? LOCALE_TARGETS.en), ...UNIVERSAL_TAIL];
  const seen = new Set<string>();
  const out: ShareTarget[] = [];

  for (const id of ids) {
    // A locale row listing e.g. 'email' would otherwise duplicate the tail.
    if (seen.has(id)) continue;
    seen.add(id);

    const target = PLATFORMS[id];
    if (!target) continue;
    if (target.enabled && !target.enabled(ctx, env)) continue;
    out.push(target);
  }

  return out;
}

/**
 * Split into what renders and what hides behind "More".
 *
 * A lone overflow item is rendered instead of hidden: a "+1 more" control costs
 * the same room as the button it conceals, so hiding one would be pure loss.
 */
export function splitVisible(
  targets: ShareTarget[],
  env: ShareEnv,
): { visible: ShareTarget[]; overflow: ShareTarget[] } {
  const cap = env.isMobile ? VISIBLE_CAP.mobile : VISIBLE_CAP.desktop;
  if (targets.length <= cap + 1) return { visible: targets, overflow: [] };
  return { visible: targets.slice(0, cap), overflow: targets.slice(cap) };
}
