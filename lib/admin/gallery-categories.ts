/** Valid gallery categories matching the database enum */
export const GALLERY_CATEGORIES = ['kitchen', 'bathroom', 'whole-house', 'commercial'] as const;

export type GalleryCategory = typeof GALLERY_CATEGORIES[number];

/** Category options for form dropdowns */
export const GALLERY_CATEGORY_OPTIONS = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'whole-house', label: 'Whole House' },
  { value: 'commercial', label: 'Commercial' },
] as const;
