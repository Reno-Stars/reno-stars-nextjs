import type { ServiceTypeKey } from '@/lib/admin/constants';

// Re-export schema types used by batch processing
export type { BatchJobStatus, BatchJobOptions } from '@/lib/db/schema';

/** Upload mode: sites (whole house) or standalone (individual projects) */
export type BatchUploadMode = 'sites' | 'standalone';

/** A single image file extracted from the ZIP */
export interface ExtractedImage {
  /** Relative path within the ZIP (e.g., "Kitchen/before-1.jpg") */
  path: string;
  /** Raw file data */
  data: Uint8Array;
  /** MIME type inferred from extension */
  mimeType: string;
}

/** A paired set of before/after images */
export interface ImagePairEntry {
  index: number;
  before: ExtractedImage | null;
  after: ExtractedImage | null;
}

/** A parsed project folder from the ZIP */
export interface ParsedProject {
  /** Folder name (e.g., "Kitchen") */
  folderName: string;
  /** Auto-detected service type */
  serviceType: ServiceTypeKey;
  /** Hero image if present at project level */
  heroImage: ExtractedImage | null;
  /** Paired before/after images sorted by index */
  imagePairs: ImagePairEntry[];
  /** Free-text notes from notes.txt / description.txt for AI context */
  notes: string | null;
  /** Raw products.txt content for external product links */
  productsText: string | null;
  /** Product images (product-1.jpg, product-2.jpg, ...) keyed by 1-based index */
  productImages: Map<number, ExtractedImage>;
}

/** A parsed site (top-level folder) from the ZIP */
export interface ParsedSite {
  /** Top-level folder name (e.g., "Richmond Whole House") */
  folderName: string;
  /** Hero image if present at site root */
  heroImage: ExtractedImage | null;
  /** Site-level before/after image pairs (root images not in any subfolder) */
  imagePairs: ImagePairEntry[];
  /** Child projects (subfolders) */
  projects: ParsedProject[];
  /** Free-text notes from notes.txt / description.txt for AI context */
  notes: string | null;
  /** Raw products.txt content for site-level external product links */
  productsText: string | null;
  /** Product images (product-1.jpg, product-2.jpg, ...) keyed by 1-based index */
  productImages: Map<number, ExtractedImage>;
}

/** A product entry parsed from products.txt */
export interface ParsedExternalProduct {
  url: string;
  imageUrl: string | null;
  labelEn: string;
  labelZh: string;
}

/** The complete parsed structure of a ZIP file */
export interface ParsedZipStructure {
  sites: ParsedSite[];
  /** Total number of image files found */
  totalImages: number;
}

/** Parsed structure for standalone projects mode (no sites) */
export interface ParsedStandaloneStructure {
  projects: ParsedProject[];
  /** Total number of image files found */
  totalImages: number;
}
