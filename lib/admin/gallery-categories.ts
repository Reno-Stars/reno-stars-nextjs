/** Valid gallery categories matching the database enum */
export const GALLERY_CATEGORIES = ['kitchen', 'bathroom', 'whole-house', 'commercial'] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Converts a category slug to a display label (e.g., 'whole-house' -> 'Whole House') */
function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Category options for form dropdowns - derived from GALLERY_CATEGORIES */
export const GALLERY_CATEGORY_OPTIONS = GALLERY_CATEGORIES.map((category) => ({
  value: category,
  label: formatCategoryLabel(category),
}));
