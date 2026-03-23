// Re-export schema types used by batch processing
export type { BatchJobStatus } from '@/lib/db/schema';

/** Maximum ZIP file size (1 GB). Shared between client validation and server. */
export const MAX_ZIP_SIZE = 1024 * 1024 * 1024;

/** Max images per presign batch request. Shared between client and server. */
export const PRESIGN_BATCH_SIZE = 20;

/** Upload mode: sites (whole house) or standalone (individual projects) */
export type BatchUploadMode = 'sites' | 'standalone';

/** Severity of a batch processing error */
export type BatchErrorSeverity = 'critical' | 'warning';

/** A structured batch processing error with severity classification */
export interface BatchError {
  message: string;
  severity: BatchErrorSeverity;
}

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
  /** Auto-detected service type (slug), null if not detectable from folder name */
  serviceType: string | null;
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
  /** Filenames of unsupported image formats (HEIC, TIFF, etc.) that were skipped */
  skippedFiles: string[];
}

/** Parsed structure for standalone projects mode (no sites) */
export interface ParsedStandaloneStructure {
  projects: ParsedProject[];
  /** Total number of image files found */
  totalImages: number;
  /** Filenames of unsupported image formats (HEIC, TIFF, etc.) that were skipped */
  skippedFiles: string[];
}

// ============================================================================
// CLIENT-SIDE MANIFEST TYPES (used by client-orchestrated batch upload)
// ============================================================================

/** A single image in the client manifest (JSON-serializable, no binary data) */
export interface ClientImage {
  /** Relative path within the ZIP */
  path: string;
  /** MIME type inferred from extension */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Pre-generated S3 key for upload */
  s3Key: string;
  /** Public URL after successful upload (set by client) */
  uploadedUrl?: string;
}

/** A paired set of before/after client images */
export interface ClientImagePair {
  index: number;
  before: ClientImage | null;
  after: ClientImage | null;
}

/** A project in the client manifest */
export interface ClientProject {
  folderName: string;
  serviceType: string | null;
  heroImage: ClientImage | null;
  imagePairs: ClientImagePair[];
  notes: string | null;
  productsText: string | null;
  /** Product images keyed by 1-based index (serialized as entries) */
  productImageEntries: [number, ClientImage][];
}

/** A site in the client manifest */
export interface ClientSite {
  folderName: string;
  heroImage: ClientImage | null;
  imagePairs: ClientImagePair[];
  projects: ClientProject[];
  notes: string | null;
  productsText: string | null;
  productImageEntries: [number, ClientImage][];
}

/** The complete client manifest returned by extractZipInBrowser() */
export interface ClientManifest {
  mode: BatchUploadMode;
  sites: ClientSite[];
  projects: ClientProject[];
  totalImages: number;
  skippedFiles: string[];
  /** All images that need uploading (flat list for batched presigning) */
  allImages: ClientImage[];
}
