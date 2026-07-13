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
  // NOTE: `accessible-bathroom` deliberately has NO matcher. It used to reuse
  // `/bathroom/i`, which made accessible-bathroom/{city} render the IDENTICAL
  // city bathroom section as bathroom/{city} — two separately-indexed URLs that
  // ended up ~90% duplicate. Accessible-bathroom combos now differentiate off
  // their own (aging-in-place) service intro + accessibility-scoped FAQs, not a
  // cloned bathroom slice.
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

/**
 * Distinct room/service words used to detect a COMBINED heading — one that
 * covers two or more services at once (e.g. Vancouver's
 * "## Kitchen Renovation & Bathroom Renovation in Vancouver"). Such a heading
 * matches BOTH `/kitchen/i` and `/bathroom/i`, so without this guard the slice
 * extractor returned the IDENTICAL section for kitchen/{city} and
 * bathroom/{city} — collapsing the very differentiator this module exists to
 * provide. We skip combined headings so each service falls back to its own
 * intro instead of cloning a shared section.
 */
const CORE_SERVICE_WORDS = [/kitchen/i, /bathroom/i, /basement/i, /\bcabinet/i, /commercial/i];

/** True when a heading names two or more distinct services (a shared section). */
export function isCombinedHeading(heading: string): boolean {
  return CORE_SERVICE_WORDS.filter((re) => re.test(heading)).length >= 2;
}

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
      // Skip combined "Kitchen & Bathroom …" headings: they'd hand the same
      // section to two different services. Keep scanning for a service-specific
      // heading; if none exists, return null (→ intro-only fallback).
      if (isCombinedHeading(h[2])) continue;
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
// 1b. Service-scoped area FAQs
// ---------------------------------------------------------------------------

/**
 * Per-service FAQ topic matchers. These are broader than SLICE_MATCHERS so they
 * catch how the DB area FAQs actually phrase a service ("How much does a
 * bathroom renovation cost in Richmond?"). Matched against the FAQ's EN
 * question+answer so scoping is locale-stable (the EN copy is authored; the 12
 * minor locales mirror it).
 *
 * Services intentionally ABSENT here — `poly-b-replacement`,
 * `critical-load-panel`, `heat-pump-hvac` — have zero service-specific projects,
 * zero area content sections AND zero area FAQs anywhere in the DB. Scoping
 * would strip their combos down to service-generic boilerplate and make them
 * near-clones city-to-city (measured 28% → 74% cross-city containment). For
 * those we keep the FULL city FAQ set as honest local context instead (see
 * `pickServiceAreaFaqs`).
 */
const FAQ_MATCHERS: Partial<Record<string, RegExp>> = {
  kitchen: /kitchen/i,
  bathroom: /bathroom|shower|vanity|bathtub|ensuite|powder room/i,
  // Accessibility-specific vocabulary only — NOT plain "bathroom", so an
  // accessible-bathroom combo does not simply clone the city bathroom FAQs.
  'accessible-bathroom': /accessible|grab bar|walk-in|wheelchair|barrier-free|curbless|aging|mobility|slip-resistant|zero-threshold|roll-in/i,
  basement: /basement|secondary suite|legal suite|egress|cellar/i,
  cabinet: /cabinet|refac|refinish|resurfac/i,
  commercial: /commercial|office|retail|tenant|storefront/i,
  'whole-house': /whole[- ]house|full home|gut renovation|multi-room|entire home/i,
  realtor: /pre-?sale|before listing|realtor|resale|selling|list your/i,
};

const ALL_FAQ_MATCHERS = Object.values(FAQ_MATCHERS) as RegExp[];

/** Minimal shape needed to classify a FAQ — its authored EN question+answer. */
export interface FaqEnText {
  question: { en: string };
  answer: { en: string };
}

/**
 * Scope a city's area FAQs to those relevant to `serviceSlug`.
 *
 * Problem: the combo route used to render EVERY active area FAQ (14–17 per city)
 * identically on every service×city page AND on the /areas/{city} hub — that
 * block is ~77% of a combo's visible text, so kitchen/{city}, bathroom/{city},
 * cabinet/{city} … were near-duplicates of each other and of the hub.
 *
 * Fix: keep the FAQs that are ABOUT this service (they also name the city, so
 * they differ on both the service and city axes) plus the city's GENERIC FAQs
 * (permits, contractor choice, bilingual service — they name the city, so they
 * still differentiate cross-city). Drop the OTHER-service FAQs (a bathroom combo
 * no longer carries the kitchen/basement Q&As). Original display order is kept.
 *
 * Services with no matcher (specialty trades with no local data) keep the full
 * set — see FAQ_MATCHERS note. Pure string filter, no DB.
 */
export function pickServiceAreaFaqs<T extends FaqEnText>(faqs: readonly T[], serviceSlug: string): T[] {
  const own = FAQ_MATCHERS[serviceSlug];
  if (!own) return [...faqs];
  return faqs.filter((f) => {
    const text = `${f.question?.en ?? ''} ${f.answer?.en ?? ''}`;
    if (own.test(text)) return true; // about THIS service → keep
    // generic city FAQ (about no specific service) → keep for city context
    return !ALL_FAQ_MATCHERS.some((re) => re.test(text));
  });
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
