/**
 * Combo-page (service × city) content differentiation helpers.
 *
 * Problem this solves: the service-location pages used to re-render the ENTIRE
 * `/areas/{city}` `content_en` on every combo, so kitchen-richmond,
 * bathroom-richmond and basement-richmond were ~71% identical and each one
 * reproduced 100% of the /areas/{city} hub. These pure helpers replace that
 * dup with a differentiated, real-data body:
 *
 *   1. A SERVICE-RELEVANT slice of the city's own area content — only the
 *      markdown section(s) about THIS service, extracted from the city's
 *      `content_en`. Differs by both city and service (kitchen-richmond pulls
 *      Richmond's kitchen section, bathroom-richmond pulls the bathroom
 *      section, kitchen-burnaby pulls Burnaby's kitchen section).
 *   2. A short service×city intro built from the real service long_description.
 *   3. Real pricing: city+service project pricing when present, else a REAL
 *      Metro-Vancouver range for the service aggregated from project data,
 *      clearly labelled as general (never fabricated).
 *   4. An honest related-project fallback: real projects for this exact
 *      city×service if any, else same-service (other city) or same-city
 *      (other service) projects — clearly labelled as related, never presented
 *      as if they were local to {city}.
 *
 * All functions are pure string/array transforms (no DB, no server-only
 * imports) so they run inside the client ServiceLocationPage bundle and are
 * unit-testable. Nothing here fabricates content — every output is derived
 * from real DB fields (area content_en, service long_description, real project
 * rows). See rule §8.
 */

import type { LocalizedProject, ServiceType } from '@/lib/types';

// ---------------------------------------------------------------------------
// 1. Service-relevant slice of the city's area content
// ---------------------------------------------------------------------------

/**
 * Per-service matcher for the heading of the relevant area-content section.
 * The area `content_en` is markdown sectioned by `##`/`###` headings such as
 * "## Kitchen Renovation in Richmond", "## Bathroom Renovation Richmond BC",
 * "## Basement Suite Conversion in Surrey". We pick the first heading that
 * matches this service and take its section (through the next same-or-higher
 * level heading, so nested `###` subsections are included).
 *
 * Services without an entry here (poly-b, critical-load-panel, heat-pump-hvac)
 * — and any city that simply has no section for a mapped service — fall back to
 * the short service×city framing instead of a dumped full-area duplicate.
 */
const SLICE_MATCHERS: Partial<Record<string, RegExp>> = {
  kitchen: /kitchen/i,
  bathroom: /bathroom/i,
  // Accessible bathroom work IS bathroom work — the city's bathroom section
  // (plumbing, waterproofing, tile, strata) is the genuinely relevant context.
  'accessible-bathroom': /bathroom/i,
  basement: /basement/i,
  cabinet: /cabinet/i,
  realtor: /pre-?\s?sale|realtor/i,
  commercial: /commercial/i,
  // Whole-house = full-home renovation; the city's cost-guide / home-renovation
  // section is the on-topic slice.
  'whole-house': /home renovation cost|renovation cost guide|renovation costs|how much does (?:a )?home/i,
};

/**
 * Headings that must never be chosen as a service slice even if they happen to
 * contain a service word — generic city/FAQ sections belong to the area hub.
 */
const EXCLUDE_HEADING = /frequently asked|neighbourhood|renovation contractor|housing stock|areas we serve/i;

const HEADING_RE = /^(#{2,3})\s+(.*)$/;

/**
 * Extract the markdown section of `areaContent` that is relevant to
 * `serviceSlug`, or `null` when the city has no such section (caller then uses
 * the framing fallback). The returned string keeps its own `##` heading so the
 * renderer shows a real section title.
 */
export function extractServiceCitySlice(
  areaContent: string | undefined | null,
  serviceSlug: string,
): string | null {
  const matcher = SLICE_MATCHERS[serviceSlug];
  if (!matcher || !areaContent) return null;

  const lines = areaContent.split('\n');
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const h = HEADING_RE.exec(lines[i]);
    if (h && matcher.test(h[2]) && !EXCLUDE_HEADING.test(h[2])) {
      start = i;
      level = h[1].length;
      break;
    }
  }
  if (start === -1) return null;

  let end = lines.length;
  for (let j = start + 1; j < lines.length; j += 1) {
    const h = HEADING_RE.exec(lines[j]);
    if (h && h[1].length <= level) {
      end = j;
      break;
    }
  }

  const section = lines.slice(start, end).join('\n').trim();
  // Guard against a heading with an empty body (nothing worth rendering).
  const body = section.replace(/^#{2,3}.*$/gm, '').trim();
  if (body.length < 40) return null;
  return section;
}

// ---------------------------------------------------------------------------
// 2. Service × city intro from the real service long_description
// ---------------------------------------------------------------------------

/** First real prose paragraph of a (markdown/HTML) long_description, capped. */
export function firstParagraph(longDescription: string | undefined | null, cap = 420): string {
  if (!longDescription) return '';
  const blocks = longDescription.split(/\n\s*\n/);
  for (const block of blocks) {
    const p = block.trim();
    if (!p || p.startsWith('#')) continue;
    // Strip a leading markdown heading marker if the block starts mid-line.
    const clean = p.replace(/^#{1,6}\s+/, '').trim();
    if (clean.length < 20) continue;
    return clean.length > cap ? `${clean.slice(0, cap).replace(/\s+\S*$/, '')}…` : clean;
  }
  const flat = longDescription.replace(/[#*_`>|-]/g, ' ').replace(/\s+/g, ' ').trim();
  return flat.length > cap ? `${flat.slice(0, cap).replace(/\s+\S*$/, '')}…` : flat;
}

// ---------------------------------------------------------------------------
// 3. Real pricing — general Metro-Vancouver range for a service, from projects
// ---------------------------------------------------------------------------

export interface CostSummary {
  count: number;
  allMin: number;
  allMax: number;
  avg: number;
}

/** Parse a single budget_range string like "$20,000 – $60,000" → {lo,hi,mid}. */
function parseBudget(range: string | undefined | null): { lo: number; hi: number; mid: number } | null {
  if (!range) return null;
  const nums = range.match(/[\d,]+/g);
  if (!nums || nums.length < 1) return null;
  const lo = parseInt(nums[0].replace(/,/g, ''), 10);
  const hi = nums.length > 1 ? parseInt(nums[1].replace(/,/g, ''), 10) : lo;
  if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
  return { lo, hi, mid: Math.round((lo + hi) / 2) };
}

/**
 * Aggregate a real cost summary from the budget_range values of `projects`.
 * Returns null when fewer than `min` projects carry a parseable range, so the
 * caller shows nothing rather than an unreliable/fabricated figure.
 */
export function summarizeProjectCosts(projects: LocalizedProject[], min = 2): CostSummary | null {
  const ranges = projects.map((p) => parseBudget(p.budget_range)).filter((r): r is NonNullable<typeof r> => r !== null);
  if (ranges.length < min) return null;
  const allMin = Math.min(...ranges.map((r) => r.lo));
  const allMax = Math.max(...ranges.map((r) => r.hi));
  const avg = Math.round(ranges.reduce((s, r) => s + r.mid, 0) / ranges.length);
  return { count: ranges.length, allMin, allMax, avg };
}

// ---------------------------------------------------------------------------
// 4. Honest related-project fallback
// ---------------------------------------------------------------------------

/**
 * How the chosen projects relate to the current combo page. Drives the honest
 * heading + availability CTA in the UI.
 *  - `exact`        real projects in THIS city for THIS service
 *  - `same-service` real projects for this service in OTHER cities
 *  - `same-city`    real projects in THIS city for OTHER services
 *  - `featured`     other real featured projects (no city/service match)
 *  - `none`         no published projects at all
 */
export type ComboRelation = 'exact' | 'same-service' | 'same-city' | 'featured' | 'none';

export interface ComboProjects {
  projects: LocalizedProject[];
  relation: ComboRelation;
}

const cityEq = (a: string | undefined | null, b: string): boolean =>
  !!a && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Featured-first ordering, stable otherwise. */
function featuredFirst(list: LocalizedProject[]): LocalizedProject[] {
  return [...list].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
}

/**
 * Choose up to `limit` real projects for a combo page and report how they
 * relate to it, so the page can label them honestly. Never invents a project
 * and never claims a non-{city} project is local — the relation the UI renders
 * always matches the real source of the projects.
 */
export function pickComboProjects(
  pool: LocalizedProject[],
  cityName: string,
  serviceSlug: ServiceType,
  limit = 3,
): ComboProjects {
  const exact = pool.filter((p) => cityEq(p.location_city, cityName) && p.service_type === serviceSlug);
  if (exact.length > 0) return { projects: featuredFirst(exact).slice(0, limit), relation: 'exact' };

  const sameService = pool.filter((p) => p.service_type === serviceSlug);
  if (sameService.length > 0) return { projects: featuredFirst(sameService).slice(0, limit), relation: 'same-service' };

  const sameCity = pool.filter((p) => cityEq(p.location_city, cityName));
  if (sameCity.length > 0) return { projects: featuredFirst(sameCity).slice(0, limit), relation: 'same-city' };

  const featured = pool.filter((p) => p.featured);
  const rest = featured.length > 0 ? featured : pool;
  if (rest.length > 0) return { projects: rest.slice(0, limit), relation: 'featured' };

  return { projects: [], relation: 'none' };
}
