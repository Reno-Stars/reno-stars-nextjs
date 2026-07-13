import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/types';
import type { NearbyProject } from '@/components/pages/NearMePage';
import { pickLocale } from '@/lib/utils';

/** Minimum exact-room matches before we surface them as "your service" work
 *  rather than falling back to honest "related recent work" framing. */
const MIN_EXACT = 3;
/** How many project cards to show on a near-me page. */
const LIMIT = 6;

function toNearby(p: Project, locale: Locale): NearbyProject | null {
  if (!p.hero_image) return null;
  return {
    slug: p.slug,
    title: pickLocale(p.title, locale),
    city: p.location_city || '',
    heroImage: p.hero_image,
  };
}

/**
 * Pick the real, published projects to surface on a room-specific near-me page.
 *
 * This is what makes the 4 room near-me pages genuinely distinct instead of
 * ~99% identical bodies: the kitchen page shows real kitchen projects, the
 * bathroom page real bathroom projects, etc. — different photos, titles, and
 * links per page. Uses ONLY real DB data (no fabrication).
 *
 * When a room has fewer than MIN_EXACT dedicated projects (e.g. basement, which
 * currently has none), we DON'T invent any — we return the most recent real
 * work across all services with `exact: false`, so the page can honestly frame
 * it as "recent work near you" / "we can take on your <room>" rather than
 * claiming those projects are something they aren't.
 *
 * `allProjects` is expected ordered newest-first (getProjectsListFromDb orders
 * by createdAt desc).
 */
export function selectNearbyProjects(
  allProjects: Project[],
  serviceType: string,
  locale: Locale
): { projects: NearbyProject[]; exact: boolean } {
  const exactMatches = allProjects
    .filter((p) => p.service_type === serviceType)
    .map((p) => toNearby(p, locale))
    .filter((p): p is NearbyProject => p !== null);

  if (exactMatches.length >= MIN_EXACT) {
    return { projects: exactMatches.slice(0, LIMIT), exact: true };
  }

  // Honest fallback: real recent work across every service, clearly framed as
  // related (never labeled as the focal room).
  const seen = new Set(exactMatches.map((p) => p.slug));
  const related = allProjects
    .map((p) => toNearby(p, locale))
    .filter((p): p is NearbyProject => p !== null && !seen.has(p.slug));

  return { projects: related.slice(0, LIMIT), exact: false };
}
