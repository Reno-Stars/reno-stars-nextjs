/**
 * Server→client payload slimming for the project LISTING grid.
 *
 * `<ProjectsPage>` is a `'use client'` component, so every prop it receives is
 * serialized into the RSC flight payload of every request (the site is
 * `force-dynamic`, so nothing amortizes it). Measured on /en/projects/ before
 * this module existed: 1.30 MB of props — 0.90 MB of `sitesAsProjects` (0.64 MB
 * of it the sites' CHILD projects) and 0.39 MB of `projects`, almost all of it
 * either (a) the same string in 14 languages or (b) SEO fields the grid never
 * renders.
 *
 * Two reductions, both output-neutral:
 *
 *  1. Collapse every nested `Localized<T>` to `{ en, <locale> }`
 *     (`deepMinimalLocalized`). Consumers read through `pickLocale` /
 *     `pickLocaleOptional`, which resolve identically off the collapsed field;
 *     `en` is retained because it terminates the fallback chain and because
 *     ProjectsPage's space-type filter reads `space_type.en` directly.
 *
 *  2. Drop fields the listing provably never reads. Each is optional on its
 *     interface, and each was already invisible on this page — `excerpt`,
 *     `meta_*`, `focus_keyword` and `seo_keywords` are not returned by
 *     `getLocalizedProject`, and the site card is built from title/description/
 *     hero/image_pairs/badge/space_type/budget/duration/aggregated only.
 *
 * The one exception worth naming: a site's child projects contribute exactly
 * three things to the grid — a fallback hero image, their `image_pairs` (merged
 * into the parent's modal gallery), and their `category` (the "child areas"
 * chips). Everything else on those rows is dead weight, which is why they get a
 * much harsher omit list than the top-level projects.
 */
import type { Locale } from '@/i18n/config';
import type { Project, SiteWithProjects } from '@/lib/types';
import { deepMinimalLocalized, slimForClient } from '@/lib/utils';

/** Not rendered by the grid; not read by `getLocalizedProject`. */
const PROJECT_OMIT = [
  'excerpt',
  'project_story',
  'meta_title',
  'meta_description',
  'focus_keyword',
  'seo_keywords',
] as const satisfies ReadonlyArray<keyof Project>;

/** A site's own SEO fields — the card renders title/description/badge only. */
const SITE_OMIT = [
  'excerpt',
  'meta_title',
  'meta_description',
  'focus_keyword',
  'seo_keywords',
] as const satisfies ReadonlyArray<keyof SiteWithProjects>;

/**
 * Child rows contribute hero_image, image_pairs and category. `title`,
 * `description`, `images` and `location_city` are required by the `Project`
 * interface, so they stay (collapsed); everything else optional goes.
 */
const CHILD_PROJECT_OMIT = [
  'excerpt',
  'project_story',
  'meta_title',
  'meta_description',
  'focus_keyword',
  'seo_keywords',
  'challenge',
  'solution',
  'service_scope',
  'dynamic_blocks',
  'external_products',
  'hero_image_alt',
  'duration',
  'space_type',
] as const satisfies ReadonlyArray<keyof Project>;

/** Slim one `Project` for the listing grid / cards / modal. */
export function slimProjectForListing(project: Project, locale: Locale): Project {
  return slimForClient(project, locale, PROJECT_OMIT);
}

/** Slim one `SiteWithProjects` (and its child rows) for the listing grid. */
export function slimSiteForListing(site: SiteWithProjects, locale: Locale): SiteWithProjects {
  const slim = slimForClient(site, locale, SITE_OMIT);
  return {
    ...slim,
    projects: site.projects.map((child) => slimForClient(child, locale, CHILD_PROJECT_OMIT)),
    aggregated: {
      ...deepMinimalLocalized(site.aggregated, locale),
      // The card reads `allServiceScopes` and `allExternalProducts`; the merged
      // `allImages` list is rebuilt client-side from `image_pairs`, so shipping
      // it is pure duplication.
      allImages: [],
    },
  };
}
