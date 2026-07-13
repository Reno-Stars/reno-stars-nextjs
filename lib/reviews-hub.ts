/**
 * Pure merge/dedupe logic for the /reviews hub.
 *
 * The hub merges three review sources:
 *  1. project_reviews rows (verified, optionally linked to a case study),
 *  2. the live google_reviews_cache payload (recent Google reviews),
 *  3. legacy testimonials rows.
 *
 * The same client sometimes appears in more than one source (and a
 * project-spanning review is stored as one project_reviews row PER project),
 * so everything is deduped before render: same author + similar text = one
 * review, preferring the project_reviews copy because it links to a case
 * study. Kept as a plain module (no DB, no React) so the dedupe rules are
 * unit-testable.
 */

import type { GoogleReview } from '@/lib/types';

/** Where a hub review came from. Lower priority number wins dedupe ties. */
export type HubReviewKind = 'project' | 'google' | 'testimonial';

const KIND_PRIORITY: Record<HubReviewKind, number> = {
  project: 0,
  google: 1,
  testimonial: 2,
};

/** Normalized review shape shared by all three hub sources. */
export interface HubReview {
  kind: HubReviewKind;
  /** Author name exactly as written on the source review. */
  authorName: string;
  rating: number;
  /** Original (source-language) review text — used for dedupe comparison. */
  body: string;
  /** Language of `body`: 'en' | 'zh'. */
  bodyLang: string;
  /** ISO 'YYYY-MM-DD' (month precision) or null when unknown. */
  reviewDate: string | null;
  sourceUrl: string | null;
  /**
   * Review platform the row came from: 'google', 'yelp', 'houzz', … Only
   * project-kind reviews carry the stored column; google-cache reviews are
   * implicitly 'google' and testimonials have no platform (null). The UI uses
   * this to render platform-accurate branding (Google mark only for google).
   */
  source?: string | null;
  /** Slug of the linked published case study, when one exists. */
  projectSlug: string | null;
  /** English city name (matches service_areas.name_en), when known. */
  city: string | null;
  /**
   * projects.service_type of the linked project (matches services.slug, e.g.
   * 'kitchen'), when known. Only project-kind reviews carry one — google and
   * testimonial reviews have no linked project, so they never join a type
   * group (mirroring how unlinked reviews fall into the null city group).
   */
  serviceType?: string | null;
  /**
   * Alternate texts of the SAME review, used only for dedupe comparison —
   * e.g. the Google original-language text when `body` is the EN machine
   * translation the Places API returned. Without it a zh review stored
   * verbatim in project_reviews could never match its EN cache copy.
   */
  altBodies?: string[];
  /** Optional per-locale translations (google cache / testimonials only). */
  translations?: Partial<Record<string, string>>;
  /** Index into the source google reviews array (google kind only). */
  googleIndex?: number;
}

/** "Richmond, BC" → "Richmond" (testimonial `location` values carry ", BC"). */
export function stripProvince(location: string): string {
  return location.replace(/,\s*(BC|B\.C\.|British Columbia)\s*$/i, '').trim();
}

/**
 * The legacy `testimonials` table shipped with 3 FABRICATED placeholder rows
 * from the original seed — invented names + generic marketing quotes, no linked
 * project. They must NEVER surface on the public /reviews hub as "verbatim
 * reviews from real clients" (data-integrity fix #6). We exclude them by a
 * (name, text-prefix) signature rather than a blanket `verified` filter,
 * because the seed marked all three `verified = true`, and because a GENUINE
 * future testimonial (real name + real quote) must still surface. The owner can
 * safely DELETE these rows from the DB to drop the exclusion entirely.
 */
export const FABRICATED_TESTIMONIAL_SIGNATURES: ReadonlyArray<{ name: string; textStartsWith: string }> = [
  { name: 'Sarah M.', textStartsWith: 'Reno Stars transformed our outdated kitchen' },
  { name: 'David L.', textStartsWith: 'Professional team from start to finish' },
  { name: 'Jennifer K.', textStartsWith: "Best renovation experience we've had" },
];

/** True when a testimonial matches one of the known fabricated seed rows. */
export function isFabricatedTestimonial(name: string, textEn: string): boolean {
  const trimmedName = name.trim();
  const trimmedText = textEn.trim();
  return FABRICATED_TESTIMONIAL_SIGNATURES.some(
    (sig) => sig.name === trimmedName && trimmedText.startsWith(sig.textStartsWith),
  );
}

function normalizeAuthor(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Han / Hiragana / Katakana / Hangul — scripts that are NOT whitespace-delimited. */
const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

function isCJKText(text: string): boolean {
  return CJK_RE.test(text);
}

/**
 * Tokenize for similarity. Latin text is split on whitespace (word tokens);
 * CJK text has no spaces, so a whole zh review collapses to ONE token and
 * word-level Jaccard becomes all-or-nothing — two near-identical short zh
 * reviews (one character apart) then score 0. For CJK tokens we emit character
 * BIGRAMS instead, so a one-character difference only perturbs a couple of
 * shingles and near-duplicates still overlap heavily.
 */
function normalizeWords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const tokens: string[] = [];
  for (const word of words) {
    if (CJK_RE.test(word)) {
      const chars = [...word];
      if (chars.length < 2) {
        tokens.push(chars[0]);
      } else {
        for (let i = 0; i < chars.length - 1; i++) tokens.push(chars[i] + chars[i + 1]);
      }
    } else {
      tokens.push(word);
    }
  }
  return tokens;
}

/**
 * Token-set Jaccard similarity in [0, 1]. Latin uses word tokens (a
 * trimmed/expanded copy of the same review still scores high); CJK uses
 * character bigrams (see normalizeWords) so short zh near-duplicates dedupe
 * instead of being all-or-nothing.
 */
export function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeWords(a));
  const wordsB = new Set(normalizeWords(b));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) if (wordsB.has(w)) intersection++;
  return intersection / (wordsA.size + wordsB.size - intersection);
}

const SIMILARITY_THRESHOLD = 0.6;
// CJK bigram Jaccard runs lower than Latin word Jaccard for the same edit
// distance (a one-char change perturbs two adjacent bigrams), so short zh
// near-duplicates need a slightly looser bar. The same-author guard in
// isDuplicateReview keeps this from over-merging unrelated reviews.
const CJK_SIMILARITY_THRESHOLD = 0.5;

/** One text-pair comparison: identical, one contains the other, or high token overlap. */
function bodiesMatch(a: string, b: string): boolean {
  const bodyA = a.trim().toLowerCase();
  const bodyB = b.trim().toLowerCase();
  if (bodyA === bodyB) return true;
  const cjk = isCJKText(bodyA) || isCJKText(bodyB);
  // Containment (a truncated/expanded copy of the same review). CJK has no
  // spaces so a shorter floor is safe; Latin keeps the original >40-char floor
  // to avoid matching on a shared common phrase.
  const containFloor = cjk ? 6 : 40;
  if (bodyA.length > containFloor && bodyB.length > containFloor && (bodyA.includes(bodyB) || bodyB.includes(bodyA))) {
    return true;
  }
  return textSimilarity(a, b) >= (cjk ? CJK_SIMILARITY_THRESHOLD : SIMILARITY_THRESHOLD);
}

/**
 * Two reviews are duplicates when the author matches AND any text variant of
 * one is similar to any text variant of the other. Variants (`altBodies`)
 * cover cross-language copies of the same review: the Google cache stores the
 * EN machine translation as `body` with the verbatim original in `altBodies`,
 * while project_reviews stores the original — only the variant comparison can
 * match those.
 */
export function isDuplicateReview(
  a: Pick<HubReview, 'authorName' | 'body' | 'altBodies'>,
  b: Pick<HubReview, 'authorName' | 'body' | 'altBodies'>,
): boolean {
  if (normalizeAuthor(a.authorName) !== normalizeAuthor(b.authorName)) return false;
  const bodiesA = [a.body, ...(a.altBodies ?? [])];
  const bodiesB = [b.body, ...(b.altBodies ?? [])];
  return bodiesA.some((ba) => bodiesB.some((bb) => bodiesMatch(ba, bb)));
}

/**
 * Collapse a list to its duplicate-cluster survivors, KEEPING INPUT ORDER: the
 * first occurrence of each cluster wins. Callers that need a priority survivor
 * pre-sort the list (see dedupeHubReviews); callers that need positional
 * determinism (grouping) rely on the SQL `asc(id)` tie-break already baked into
 * the input order.
 */
function dedupeInOrder(reviews: HubReview[]): HubReview[] {
  const kept: HubReview[] = [];
  for (const candidate of reviews) {
    if (!kept.some((existing) => isDuplicateReview(existing, candidate))) {
      kept.push(candidate);
    }
  }
  return kept;
}

/**
 * Dedupe merged hub reviews. Candidates are ranked project > google >
 * testimonial (the project copy links to a case study), then newest first;
 * the first survivor of each duplicate cluster wins. Ties inside the sort are
 * broken by input order, which is deterministic because the DB fetchers append
 * `asc(id)` to their ORDER BY (identical author/date rows no longer flip on
 * cache regen).
 */
export function dedupeHubReviews(reviews: HubReview[]): HubReview[] {
  const ranked = [...reviews].sort((a, b) => {
    const byKind = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
    if (byKind !== 0) return byKind;
    return (b.reviewDate ?? '').localeCompare(a.reviewDate ?? '');
  });
  return dedupeInOrder(ranked);
}

/** One rendered city section on the hub. `city` null = no known city. */
export interface HubCityGroup {
  city: string | null;
  reviews: HubReview[];
}

/**
 * Group non-google survivors by city, biggest group first (ties: city name),
 * with the unknown-city group (if any) always last. Reviews inside a group
 * stay newest-first.
 */
export function groupReviewsByCity(reviews: HubReview[]): HubCityGroup[] {
  // Group by a NORMALIZED key (trim + lower) so 'Burnaby ' and 'burnaby' land
  // in ONE group — matching how getReviewsByCityFromDb joins with LOWER(). The
  // canonical display name is the first non-empty original seen (trimmed).
  const NULL_KEY = ' ::null';
  const byCity = new Map<string, { city: string | null; reviews: HubReview[] }>();
  for (const review of reviews) {
    const raw = review.city?.trim() ?? '';
    const key = raw ? raw.toLowerCase() : NULL_KEY;
    const bucket = byCity.get(key);
    if (bucket) {
      bucket.reviews.push(review);
    } else {
      byCity.set(key, { city: raw || null, reviews: [review] });
    }
  }
  const groups = Array.from(byCity.values()).map((group) => ({
    city: group.city,
    reviews: [...group.reviews].sort((a, b) => (b.reviewDate ?? '').localeCompare(a.reviewDate ?? '')),
  }));
  return groups.sort((a, b) => {
    if (a.city === null) return 1;
    if (b.city === null) return -1;
    if (b.reviews.length !== a.reviews.length) return b.reviews.length - a.reviews.length;
    return a.city.localeCompare(b.city);
  });
}

/** One rendered project-type section on the hub. */
export interface HubTypeGroup {
  /** Raw projects.service_type value (matches services.slug). */
  serviceType: string;
  reviews: HubReview[];
}

/**
 * Group reviews by their linked project's service_type, biggest group first
 * (ties: type name), reviews newest-first inside a group. Reviews WITHOUT a
 * serviceType (unlinked reviews, google reviews, testimonials, projects with
 * no type set) are skipped entirely — there is no "unknown type" bucket, so
 * those reviews keep appearing only where they already do.
 *
 * PER-TYPE PRESENCE (multi-project intent): a review whose job spans a kitchen
 * AND a bathroom project is stored as one row PER project (each with its own
 * service_type), and SHOULD appear under BOTH type groups. So the caller passes
 * the full per-project rows here (NOT the globally-collapsed survivors used for
 * the city grouping): the kitchen row joins the kitchen group, the bathroom row
 * joins the bathroom group. Dedupe is applied WITHIN each type only — a genuine
 * duplicate of the same review under the SAME type (e.g. two same-type projects
 * for one client with identical text) collapses to one card, but the
 * cross-type presence is preserved.
 */
export function groupReviewsByServiceType(reviews: HubReview[]): HubTypeGroup[] {
  const byType = new Map<string, HubReview[]>();
  for (const review of reviews) {
    if (!review.serviceType) continue;
    const bucket = byType.get(review.serviceType) ?? [];
    bucket.push(review);
    byType.set(review.serviceType, bucket);
  }
  const groups = Array.from(byType.entries()).map(([serviceType, groupReviews]) => ({
    serviceType,
    reviews: dedupeInOrder(groupReviews).sort((a, b) => (b.reviewDate ?? '').localeCompare(a.reviewDate ?? '')),
  }));
  return groups.sort((a, b) => {
    if (b.reviews.length !== a.reviews.length) return b.reviews.length - a.reviews.length;
    return a.serviceType.localeCompare(b.serviceType);
  });
}

/** project_reviews row (joined with its project) as fetched for the hub. */
export interface HubProjectReviewRow {
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  reviewDate: string;
  sourceUrl: string | null;
  /** Review platform ('google', 'yelp', …) from project_reviews.source. */
  source: string;
  /** Slug of the linked PUBLISHED project (null when unlinked/unpublished). */
  projectSlug: string | null;
  /** projects.location_city of the linked project. */
  city: string | null;
  /** projects.service_type of the linked project (matches services.slug). */
  serviceType?: string | null;
}

/** testimonials row as fetched for the hub. */
export interface HubTestimonialRow {
  name: string;
  rating: number;
  textEn: string;
  location: string | null;
  /** Per-locale translations assembled from text_zh + localizations jsonb. */
  translations: Partial<Record<string, string>>;
}

export interface ReviewsHub {
  /** Indices into the input google reviews array that survived dedupe. */
  googleIndices: number[];
  /** Non-google survivors grouped by city (project + testimonial reviews). */
  cityGroups: HubCityGroup[];
  /** Project-linked reviews grouped by their project's service_type. */
  typeGroups: HubTypeGroup[];
}

/** Merge + dedupe + group the three hub sources. Pure — no DB access. */
export function buildReviewsHub(input: {
  projectReviews: HubProjectReviewRow[];
  googleReviews: GoogleReview[];
  testimonials: HubTestimonialRow[];
}): ReviewsHub {
  const projectHubReviews: HubReview[] = input.projectReviews.map((row): HubReview => ({
    kind: 'project',
    authorName: row.authorName,
    rating: row.rating,
    body: row.body,
    bodyLang: row.bodyLang,
    reviewDate: row.reviewDate,
    sourceUrl: row.sourceUrl,
    source: row.source,
    projectSlug: row.projectSlug,
    city: row.city,
    serviceType: row.serviceType ?? null,
  }));
  const merged: HubReview[] = [
    ...projectHubReviews,
    ...input.googleReviews.map((review, index): HubReview => ({
      kind: 'google',
      authorName: review.authorName,
      rating: review.rating,
      body: review.text,
      bodyLang: review.languageCode || 'en',
      reviewDate: review.publishTime ? review.publishTime.slice(0, 10) : null,
      sourceUrl: review.authorUri || null,
      source: 'google',
      projectSlug: null,
      city: null,
      ...(review.originalText ? { altBodies: [review.originalText] } : {}),
      googleIndex: index,
    })),
    ...input.testimonials.map((row): HubReview => ({
      kind: 'testimonial',
      authorName: row.name,
      rating: row.rating,
      body: row.textEn,
      bodyLang: 'en',
      reviewDate: null,
      sourceUrl: null,
      source: null,
      projectSlug: null,
      city: row.location ? stripProvince(row.location) : null,
      translations: row.translations,
    })),
  ];

  const survivors = dedupeHubReviews(merged);
  const googleIndices = survivors
    .filter((r) => r.kind === 'google' && r.googleIndex !== undefined)
    .map((r) => r.googleIndex as number)
    .sort((a, b) => a - b);
  const nonGoogle = survivors.filter((r) => r.kind !== 'google');
  // CITY grouping uses the globally-deduped survivors: a multi-project job in
  // ONE city shows a single card.
  const cityGroups = groupReviewsByCity(nonGoogle);
  // TYPE grouping uses the FULL per-project rows (NOT survivors): a review that
  // spans a kitchen AND a bathroom project appears under BOTH type groups
  // (groupReviewsByServiceType dedupes within a type, never globally). Only
  // project rows carry a serviceType, so google/testimonial/unlinked reviews
  // are naturally excluded.
  const typeGroups = groupReviewsByServiceType(projectHubReviews);

  return { googleIndices, cityGroups, typeGroups };
}
