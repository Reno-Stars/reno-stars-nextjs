import { unzip } from 'fflate';
import type {
  ExtractedImage,
  ImagePairEntry,
  ParsedProject,
  ParsedSite,
  ParsedStandaloneStructure,
  ParsedZipStructure,
} from './types';

// ============================================================================
// MIME TYPE DETECTION
// ============================================================================

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

const IMAGE_EXTENSIONS = new Set(Object.keys(EXT_TO_MIME));

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
}

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(getExtension(filename));
}

function getMimeType(filename: string): string {
  return EXT_TO_MIME[getExtension(filename)] || 'image/jpeg';
}

// ============================================================================
// NOTES FILE DETECTION
// ============================================================================

/** Recognized filenames for project/site description text */
const NOTES_FILENAMES = new Set([
  'notes.txt',
  'description.txt',
  'readme.txt',
  'info.txt',
  'notes.md',
  'description.md',
  'readme.md',
]);

/** Recognized filenames for external product links */
const PRODUCTS_FILENAMES = new Set([
  'products.txt',
  'links.txt',
  'external.txt',
]);

function isNotesFile(filename: string): boolean {
  return NOTES_FILENAMES.has(filename.toLowerCase());
}

function isProductsFile(filename: string): boolean {
  return PRODUCTS_FILENAMES.has(filename.toLowerCase());
}

// ============================================================================
// SERVICE TYPE DETECTION
// ============================================================================

const SERVICE_TYPE_ALIASES: Record<string, string> = {
  kitchen: 'kitchen',
  bath: 'bathroom',
  bathroom: 'bathroom',
  washroom: 'bathroom',
  basement: 'basement',
  cabinet: 'cabinet',
  cabinetry: 'cabinet',
  commercial: 'commercial',
  office: 'commercial',
  retail: 'commercial',
  store: 'commercial',
};

const DEFAULT_SERVICE_TYPE: string = 'kitchen';

export function detectServiceType(folderName: string): string {
  const lower = folderName.toLowerCase().trim();
  // Try exact match first
  if (SERVICE_TYPE_ALIASES[lower]) return SERVICE_TYPE_ALIASES[lower];
  // Try partial match (folder name contains a keyword)
  for (const [alias, type] of Object.entries(SERVICE_TYPE_ALIASES)) {
    if (lower.includes(alias)) return type;
  }
  return DEFAULT_SERVICE_TYPE;
}

// ============================================================================
// IMAGE PAIRING
// ============================================================================

/**
 * Matches before/after images by numeric suffix and extracts product images.
 * - "before-1.jpg" / "after-1.jpg" → pair index 1
 * - "before.jpg" / "after.jpg" → pair index 0
 * - "product-1.jpg" → product image for 1st products.txt entry
 * - Unmatched images → after-only pairs
 */
function pairImages(images: ExtractedImage[]): {
  pairs: ImagePairEntry[];
  heroImage: ExtractedImage | null;
  productImages: Map<number, ExtractedImage>;
} {
  let heroImage: ExtractedImage | null = null;
  const beforeMap = new Map<number, ExtractedImage>();
  const afterMap = new Map<number, ExtractedImage>();
  const productImages = new Map<number, ExtractedImage>();
  const unpaired: ExtractedImage[] = [];

  for (const img of images) {
    const basename = img.path.split('/').pop()!;
    const nameWithoutExt = basename.replace(/\.[^.]+$/, '').toLowerCase();

    // Check for hero image
    if (nameWithoutExt === 'hero') {
      heroImage = img;
      continue;
    }

    // Match product-N pattern (1-based index, accept hyphen or space)
    const productMatch = nameWithoutExt.match(/^product[- ](\d+)$/);
    if (productMatch) {
      const productIdx = parseInt(productMatch[1], 10);
      if (productIdx >= 1 && productIdx <= 999) {
        productImages.set(productIdx, img);
      }
      continue;
    }

    // Match before-N / after-N patterns (accept hyphen or space as separator)
    const beforeMatch = nameWithoutExt.match(/^before(?:[- ](\d+))?$/);
    const afterMatch = nameWithoutExt.match(/^after(?:[- ](\d+))?$/);

    if (beforeMatch) {
      const idx = beforeMatch[1] ? parseInt(beforeMatch[1], 10) : 0;
      if (idx >= 0 && idx <= 999) beforeMap.set(idx, img);
    } else if (afterMatch) {
      const idx = afterMatch[1] ? parseInt(afterMatch[1], 10) : 0;
      if (idx >= 0 && idx <= 999) afterMap.set(idx, img);
    } else {
      // Unpaired image → treat as after-only
      unpaired.push(img);
    }
  }

  // Merge before and after maps into pairs
  const allIndices = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const pairs: ImagePairEntry[] = [];

  for (const idx of [...allIndices].sort((a, b) => a - b)) {
    pairs.push({
      index: idx,
      before: beforeMap.get(idx) ?? null,
      after: afterMap.get(idx) ?? null,
    });
  }

  // Append unpaired images as after-only pairs
  let nextIndex = pairs.length > 0 ? Math.max(...pairs.map((p) => p.index)) + 1 : 0;
  for (const img of unpaired) {
    pairs.push({ index: nextIndex++, before: null, after: img });
  }

  return { pairs, heroImage, productImages };
}

// ============================================================================
// ASYNC UNZIP WRAPPER
// ============================================================================

function unzipAsync(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ============================================================================
// SHARED FILE EXTRACTION
// ============================================================================

interface ZipExtraction {
  tree: Map<string, ExtractedImage[]>;
  notesMap: Map<string, string>;
  productsMap: Map<string, string>;
  totalImages: number;
}

/**
 * Extracts and categorizes all files from a ZIP buffer.
 * Shared by both parseZip (sites mode) and parseZipStandalone.
 */
async function extractFilesFromZip(zipBuffer: Uint8Array): Promise<ZipExtraction> {
  const files = await unzipAsync(zipBuffer);
  let totalImages = 0;

  const tree = new Map<string, ExtractedImage[]>();
  const notesMap = new Map<string, string>();
  const productsMap = new Map<string, string>();
  const textDecoder = new TextDecoder('utf-8');

  for (const [path, data] of Object.entries(files)) {
    // Skip directories, __MACOSX entries, and macOS resource fork files (._prefix)
    if (path.endsWith('/') || path.includes('__MACOSX')) continue;

    const normalizedPath = path.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');
    const filename = parts.pop()!;

    if (filename.startsWith('._')) continue;
    const folder = parts.join('/');

    // Check for notes/description files
    if (isNotesFile(filename)) {
      try {
        const text = textDecoder.decode(data).trim();
        if (text.length > 0 && !notesMap.has(folder)) {
          notesMap.set(folder, text);
        }
      } catch {
        // Skip files that can't be decoded as UTF-8
      }
      continue;
    }

    // Check for products.txt files
    if (isProductsFile(filename)) {
      try {
        const text = textDecoder.decode(data).trim();
        if (text.length > 0 && !productsMap.has(folder)) {
          productsMap.set(folder, text);
        }
      } catch {
        // Skip files that can't be decoded as UTF-8
      }
      continue;
    }

    if (!isImageFile(filename)) continue;

    totalImages++;

    const img: ExtractedImage = {
      path: normalizedPath,
      data,
      mimeType: getMimeType(normalizedPath),
    };

    if (!tree.has(folder)) tree.set(folder, []);
    tree.get(folder)!.push(img);
  }

  return { tree, notesMap, productsMap, totalImages };
}

// ============================================================================
// ZIP PARSING (SITES MODE)
// ============================================================================

/**
 * Parses a ZIP file buffer into a structured site/project/image tree.
 *
 * Supports two layouts:
 * 1. Nested: top-level folder = site, subfolders = projects
 * 2. Flat: all images at root = single project, auto-wrapped in a site
 */
export async function parseZip(zipBuffer: Uint8Array): Promise<ParsedZipStructure> {
  const { tree, notesMap, productsMap, totalImages } = await extractFilesFromZip(zipBuffer);

  if (totalImages === 0) {
    return { sites: [], totalImages: 0 };
  }

  // Analyze the folder structure to determine if nested or flat
  const folders = [...tree.keys()].sort();

  // Case 1: All images at root (flat structure)
  if (folders.length === 1 && folders[0] === '') {
    const images = tree.get('')!;
    const rootNotes = notesMap.get('') ?? null;
    const rootProducts = productsMap.get('') ?? null;
    const { pairs, heroImage, productImages } = pairImages(images);
    // Flat layout: site is a synthetic wrapper — project owns products
    const site: ParsedSite = {
      folderName: 'Uploaded Project',
      heroImage,
      imagePairs: [],
      notes: rootNotes,
      productsText: null,
      productImages: new Map(),
      projects: pairs.length > 0 ? [{
        folderName: 'Uploaded Project',
        serviceType: DEFAULT_SERVICE_TYPE,
        heroImage: null,
        imagePairs: pairs,
        notes: rootNotes,
        productsText: rootProducts,
        productImages,
      }] : [],
    };
    return { sites: [site], totalImages };
  }

  // Determine nesting depth
  // Find the common prefix depth and group accordingly
  const topLevelFolders = new Map<string, Map<string, ExtractedImage[]>>();
  const topLevelImages = new Map<string, ExtractedImage[]>();

  for (const [folder, images] of tree) {
    const parts = folder.split('/');
    const topLevel = parts[0] || folder;
    const subFolder = parts.length > 1 ? parts.slice(1).join('/') : '';

    if (subFolder === '') {
      // Images directly in the top-level folder
      if (!topLevelImages.has(topLevel)) topLevelImages.set(topLevel, []);
      topLevelImages.get(topLevel)!.push(...images);
    } else {
      // Images in a subfolder
      if (!topLevelFolders.has(topLevel)) topLevelFolders.set(topLevel, new Map());
      const subs = topLevelFolders.get(topLevel)!;
      if (!subs.has(subFolder)) subs.set(subFolder, []);
      subs.get(subFolder)!.push(...images);
    }
  }

  const sites: ParsedSite[] = [];

  for (const topLevel of new Set([...topLevelFolders.keys(), ...topLevelImages.keys()])) {
    const subFolders = topLevelFolders.get(topLevel);
    const rootImages = topLevelImages.get(topLevel) ?? [];

    // Parse root-level images of this top folder for hero
    const { pairs: rootPairs, heroImage: siteHero, productImages: siteProductImages } = pairImages(rootImages);

    const projects: ParsedProject[] = [];

    // Resolve notes for this top-level folder
    const siteNotes = notesMap.get(topLevel) ?? null;

    // Resolve products text for this top-level folder
    const siteProducts = productsMap.get(topLevel) ?? null;

    // If there are subfolders, each subfolder is a project
    // Root-level images become site-level image pairs (not a project)
    if (subFolders && subFolders.size > 0) {
      for (const [subName, subImages] of subFolders) {
        const leafName = subName.split('/').pop()!;
        const subFolderPath = `${topLevel}/${subName}`;
        const projectNotes = notesMap.get(subFolderPath) ?? null;
        const projectProducts = productsMap.get(subFolderPath) ?? null;
        const { pairs, heroImage: projectHero, productImages: projectProductImages } = pairImages(subImages);
        if (pairs.length > 0 || projectHero) {
          projects.push({
            folderName: leafName,
            serviceType: detectServiceType(leafName),
            heroImage: projectHero,
            imagePairs: pairs,
            notes: projectNotes,
            productsText: projectProducts,
            productImages: projectProductImages,
          });
        }
      }
    } else {
      // No subfolders → the top-level folder itself is a single project
      if (rootPairs.length > 0) {
        projects.push({
          folderName: topLevel,
          serviceType: detectServiceType(topLevel),
          heroImage: null,
          imagePairs: rootPairs,
          notes: siteNotes,
          productsText: siteProducts,
          productImages: siteProductImages, // Same images since single-folder
        });
      }
    }

    // Site-level image pairs only for nested layouts (root images alongside subfolders).
    // For single-folder layouts (no subfolders), pairs belong to the project only.
    const hasSubfolders = subFolders && subFolders.size > 0;

    // For single-folder layouts, project owns products; site is a synthetic wrapper
    const isSingleFolder = !hasSubfolders;
    if (projects.length > 0 || siteHero || rootPairs.length > 0) {
      sites.push({
        folderName: topLevel,
        heroImage: siteHero,
        imagePairs: hasSubfolders ? rootPairs : [],
        projects,
        notes: siteNotes,
        productsText: isSingleFolder ? null : siteProducts,
        productImages: isSingleFolder ? new Map() : siteProductImages,
      });
    }
  }

  return { sites, totalImages };
}

// ============================================================================
// ZIP PARSING (STANDALONE PROJECTS MODE)
// ============================================================================

/**
 * Parses a ZIP file for standalone projects mode.
 * Each top-level folder = one standalone project (no site wrapper).
 * Flat images at root = single project.
 */
export async function parseZipStandalone(zipBuffer: Uint8Array): Promise<ParsedStandaloneStructure> {
  const { tree, notesMap, productsMap, totalImages } = await extractFilesFromZip(zipBuffer);

  if (totalImages === 0) {
    return { projects: [], totalImages: 0 };
  }

  const projectsResult: ParsedProject[] = [];

  // Collect all images per top-level folder (flatten subfolders into parent).
  // Notes/products from subfolders are intentionally ignored — only the
  // top-level folder's text files are used for standalone projects.
  const topLevelImages = new Map<string, ExtractedImage[]>();
  const topLevelNotes = new Map<string, string>();
  const topLevelProducts = new Map<string, string>();

  for (const [folder, images] of tree) {
    if (folder === '') {
      // Root-level images
      if (!topLevelImages.has('')) topLevelImages.set('', []);
      topLevelImages.get('')!.push(...images);
    } else {
      const topLevel = folder.split('/')[0];
      if (!topLevelImages.has(topLevel)) topLevelImages.set(topLevel, []);
      topLevelImages.get(topLevel)!.push(...images);
    }
  }

  // Collect notes/products for top-level folders
  for (const [folder, text] of notesMap) {
    const topLevel = folder === '' ? '' : folder.split('/')[0];
    if (!topLevelNotes.has(topLevel)) topLevelNotes.set(topLevel, text);
  }
  for (const [folder, text] of productsMap) {
    const topLevel = folder === '' ? '' : folder.split('/')[0];
    if (!topLevelProducts.has(topLevel)) topLevelProducts.set(topLevel, text);
  }

  // Flat root case: all images at root = single project
  if (topLevelImages.size === 1 && topLevelImages.has('')) {
    const images = topLevelImages.get('')!;
    const { pairs, heroImage, productImages } = pairImages(images);
    if (pairs.length > 0 || heroImage) {
      projectsResult.push({
        folderName: 'Uploaded Project',
        serviceType: DEFAULT_SERVICE_TYPE,
        heroImage,
        imagePairs: pairs,
        notes: topLevelNotes.get('') ?? null,
        productsText: topLevelProducts.get('') ?? null,
        productImages,
      });
    }
    return { projects: projectsResult, totalImages };
  }

  // Each top-level folder = one standalone project
  for (const [topLevel, images] of topLevelImages) {
    if (topLevel === '') continue; // skip stray root images
    const { pairs, heroImage, productImages } = pairImages(images);
    if (pairs.length > 0 || heroImage) {
      projectsResult.push({
        folderName: topLevel,
        serviceType: detectServiceType(topLevel),
        heroImage,
        imagePairs: pairs,
        notes: topLevelNotes.get(topLevel) ?? null,
        productsText: topLevelProducts.get(topLevel) ?? null,
        productImages,
      });
    }
  }

  return { projects: projectsResult, totalImages };
}
