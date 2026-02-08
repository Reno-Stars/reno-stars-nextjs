/**
 * Helper functions for query aggregation operations.
 * Extracted for testability and reuse.
 */

import type { Project, Localized, Site, SiteWithProjects } from '../types';

/**
 * Parse a budget range string like "$15,000 - $25,000" and extract min/max values.
 * Returns null for non-parseable budget strings (e.g., "TBD", "Call for quote").
 */
export function parseBudgetRange(budget: string): { min: number; max: number } | null {
  // Skip common non-numeric budget indicators
  const lowerBudget = budget.toLowerCase();
  if (lowerBudget.includes('tbd') || lowerBudget.includes('call') || lowerBudget.includes('quote')) {
    return null;
  }
  const numbers = budget.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return null;
  const values = numbers.map((n) => parseInt(n.replace(/,/g, ''), 10)).filter((v) => v > 0);
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Calculate combined budget range from multiple projects.
 * Only includes projects with valid numeric budgets.
 */
export function calculateCombinedBudget(projects: Project[]): string | undefined {
  const budgets = projects
    .filter((p) => p.budget_range)
    .map((p) => parseBudgetRange(p.budget_range!))
    .filter((b): b is { min: number; max: number } => b !== null);
  if (budgets.length === 0) return undefined;
  const totalMin = budgets.reduce((sum, b) => sum + b.min, 0);
  const totalMax = budgets.reduce((sum, b) => sum + b.max, 0);
  if (totalMin === 0 && totalMax === 0) return undefined;
  const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);
  if (totalMin === totalMax) return `$${formatNumber(totalMin)}`;
  return `$${formatNumber(totalMin)} - $${formatNumber(totalMax)}`;
}

/**
 * Aggregate durations from multiple projects.
 * Returns a summary like "12 weeks total" or combines different formats.
 *
 * Note: Uses the English duration as the source of truth for week parsing,
 * then generates appropriate ZH output. This ensures consistency when
 * EN/ZH durations use different formats (e.g., "4 weeks" vs "1个月").
 */
export function aggregateDurations(projects: Project[]): Localized<string> | undefined {
  const durations = projects.filter((p) => p.duration);
  if (durations.length === 0) return undefined;
  // Sum weeks if all have week-based durations, otherwise concatenate
  const weekPattern = /(\d+)\s*(?:weeks?|wks?)/i;
  let totalWeeks = 0;
  let canAggregate = true;
  for (const p of durations) {
    const matchEn = p.duration!.en.match(weekPattern);
    if (matchEn) {
      totalWeeks += parseInt(matchEn[1], 10);
    } else {
      canAggregate = false;
      break;
    }
  }
  if (canAggregate && totalWeeks > 0) {
    return {
      en: `${totalWeeks} weeks total`,
      zh: `共${totalWeeks}周`,
    };
  }
  // Fallback: list durations
  return {
    en: durations.map((p) => p.duration!.en).join(', '),
    zh: durations.map((p) => p.duration!.zh).join('，'),
  };
}

/**
 * Merge unique service scopes from multiple projects.
 */
export function mergeServiceScopes(projects: Project[]): Localized<string[]> {
  const scopesEn = new Set<string>();
  const scopesZh = new Set<string>();
  for (const p of projects) {
    if (p.service_scope) {
      p.service_scope.en.forEach((s) => scopesEn.add(s));
      p.service_scope.zh.forEach((s) => scopesZh.add(s));
    }
  }
  return {
    en: Array.from(scopesEn),
    zh: Array.from(scopesZh),
  };
}

/**
 * Collect all images from projects belonging to a site, with project attribution.
 * If a site is provided and has images, they are prepended with `projectSlug: '__site__'`.
 */
export function collectAllImages(projects: Project[], site?: Site): SiteWithProjects['aggregated']['allImages'] {
  const images: SiteWithProjects['aggregated']['allImages'] = [];

  // Prepend site-level images (if any)
  if (site?.images && site.images.length > 0) {
    for (const img of site.images) {
      images.push({
        src: img.src,
        alt: img.alt,
        is_before: img.is_before,
        projectSlug: '__site__',
        projectTitle: site.title,
      });
    }
  }

  for (const project of projects) {
    for (const img of project.images) {
      images.push({
        src: img.src,
        alt: img.alt,
        is_before: img.is_before,
        projectSlug: project.slug,
        projectTitle: project.title,
      });
    }
  }
  return images;
}

/**
 * Collect all external products from projects, deduped by URL.
 */
export function collectAllExternalProducts(projects: Project[]): SiteWithProjects['aggregated']['allExternalProducts'] {
  const seen = new Set<string>();
  const products: SiteWithProjects['aggregated']['allExternalProducts'] = [];
  for (const project of projects) {
    if (project.external_products) {
      for (const ep of project.external_products) {
        if (!seen.has(ep.url)) {
          seen.add(ep.url);
          products.push({
            url: ep.url,
            image_url: ep.image_url,
            label: ep.label,
          });
        }
      }
    }
  }
  return products;
}
