/**
 * Helper functions for query aggregation operations.
 * Extracted for testability and reuse.
 */

import type { Project, Localized, Site, SiteWithProjects, ImagePair } from '../types';

/** Sentinel slug used for site-level images in aggregated image lists. */
export const SITE_IMAGE_SLUG = '__site__';

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

/** A single attributed image entry from the aggregated site image list. */
type AggregatedImage = SiteWithProjects['aggregated']['allImages'][0];

/**
 * Extract images from an ImagePair array into flat arrays suitable for aggregation.
 */
function extractImagesFromPairs(pairs: ImagePair[], slug: string, title: Localized<string>): AggregatedImage[] {
  const images: AggregatedImage[] = [];

  for (const pair of pairs) {
    if (pair.beforeImage) {
      images.push({
        src: pair.beforeImage.src,
        alt: pair.beforeImage.alt,
        is_before: true,
        projectSlug: slug,
        projectTitle: title,
      });
    }
    if (pair.afterImage) {
      images.push({
        src: pair.afterImage.src,
        alt: pair.afterImage.alt,
        is_before: false,
        projectSlug: slug,
        projectTitle: title,
      });
    }
  }

  return images;
}

/**
 * Collect all images from projects belonging to a site, with project attribution.
 * If a site is provided and has images, they are prepended with `projectSlug: '__site__'`.
 * Deduplicates by image src URL.
 *
 * Supports both legacy flat images and new image_pairs structure.
 * Prioritizes image_pairs if available, falls back to legacy images.
 */
export function collectAllImages(projects: Project[], site?: Site): SiteWithProjects['aggregated']['allImages'] {
  const images: SiteWithProjects['aggregated']['allImages'] = [];
  const seen = new Set<string>();

  // Helper to add image if not already seen
  const addImage = (img: SiteWithProjects['aggregated']['allImages'][0]) => {
    if (!seen.has(img.src)) {
      seen.add(img.src);
      images.push(img);
    }
  };

  // Prepend site-level images (if any)
  // Prefer image_pairs, fall back to legacy images
  if (site?.image_pairs && site.image_pairs.length > 0) {
    const siteImages = extractImagesFromPairs(site.image_pairs, SITE_IMAGE_SLUG, site.title);
    siteImages.forEach(addImage);
  } else if (site?.images && site.images.length > 0) {
    for (const img of site.images) {
      addImage({
        src: img.src,
        alt: img.alt,
        is_before: img.is_before,
        projectSlug: SITE_IMAGE_SLUG,
        projectTitle: site.title,
      });
    }
  }

  // Process project images
  for (const project of projects) {
    // Prefer image_pairs, fall back to legacy images
    if (project.image_pairs && project.image_pairs.length > 0) {
      const projectImages = extractImagesFromPairs(project.image_pairs, project.slug, project.title);
      projectImages.forEach(addImage);
    } else {
      for (const img of project.images) {
        addImage({
          src: img.src,
          alt: img.alt,
          is_before: img.is_before,
          projectSlug: project.slug,
          projectTitle: project.title,
        });
      }
    }
  }

  return images;
}

/**
 * Collect all external products from site + projects, deduped by URL.
 * Site-level products appear first, then project-level products.
 */
export function collectAllExternalProducts(projects: Project[], site?: Site): SiteWithProjects['aggregated']['allExternalProducts'] {
  const seen = new Set<string>();
  const products: SiteWithProjects['aggregated']['allExternalProducts'] = [];
  // Site-level products first
  if (site?.external_products) {
    for (const ep of site.external_products) {
      if (!seen.has(ep.url)) {
        seen.add(ep.url);
        products.push({ url: ep.url, image_url: ep.image_url, label: ep.label });
      }
    }
  }
  // Then project-level products
  for (const project of projects) {
    if (project.external_products) {
      for (const ep of project.external_products) {
        if (!seen.has(ep.url)) {
          seen.add(ep.url);
          products.push({ url: ep.url, image_url: ep.image_url, label: ep.label });
        }
      }
    }
  }
  return products;
}
