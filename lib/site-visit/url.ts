/**
 * Encodes the visitor's picks into the query string so a coordinator can send
 * a worker a link that opens already configured — the office knows the scope
 * before the worker leaves, and the worker doesn't rebuild it at the door.
 *
 * Format: ?bathrooms=<modelId>,<addonId>,<addonId>&kitchen=<modelId>,…
 * First value is the model; the rest are add-ons. Ids are already URL-safe
 * (lowercase, hyphens), so nothing needs escaping.
 */
import type { SectionSelection, SiteVisitCatalog } from './types';
import { sanitizeSelection } from './resolve';

export function encodeSelections(selections: SectionSelection[]): string {
  const params = new URLSearchParams();
  for (const sel of selections) {
    if (!sel.modelId) continue;
    params.set(sel.sectionId, [sel.modelId, ...sel.addonIds].join(','));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Reads selections back out of a query string, dropping anything that doesn't
 * exist in the catalog. A stale or hand-edited link degrades to a valid subset
 * rather than throwing.
 */
export function decodeSelections(
  catalog: SiteVisitCatalog,
  params: URLSearchParams | Record<string, string | undefined>,
): SectionSelection[] {
  const get = (key: string): string | undefined =>
    params instanceof URLSearchParams ? (params.get(key) ?? undefined) : params[key];

  const out: SectionSelection[] = [];
  for (const section of catalog.sections) {
    const raw = get(section.id);
    if (!raw) continue;
    const [modelId, ...addonIds] = raw.split(',').filter(Boolean);
    if (!modelId) continue;
    const sel = sanitizeSelection(section, modelId, addonIds);
    if (sel) out.push(sel);
  }
  return out;
}
