import type { ServiceTypeKey } from '@/lib/admin/constants';

// Re-export schema types used by batch processing
export type { BatchJobStatus, BatchJobOptions } from '@/lib/db/schema';

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
}

/** A parsed site (top-level folder) from the ZIP */
export interface ParsedSite {
  /** Top-level folder name (e.g., "Richmond Whole House") */
  folderName: string;
  /** Hero image if present at site root */
  heroImage: ExtractedImage | null;
  /** Child projects (subfolders) */
  projects: ParsedProject[];
  /** Free-text notes from notes.txt / description.txt for AI context */
  notes: string | null;
}

/** The complete parsed structure of a ZIP file */
export interface ParsedZipStructure {
  sites: ParsedSite[];
  /** Total number of image files found */
  totalImages: number;
}
