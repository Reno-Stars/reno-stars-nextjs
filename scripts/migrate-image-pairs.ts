/**
 * Migration script to convert individual project/site images with `isBefore` flags
 * into paired before/after entries with SEO metadata.
 *
 * Algorithm:
 * 1. For each project/site, get images sorted by displayOrder
 * 2. Iterate through images:
 *    - If current is "before" AND next is "after": create pair with both, skip 2
 *    - If current is "before" only: create before-only pair, skip 1
 *    - If current is "after": create after-only pair, skip 1
 * 3. Insert pairs into new tables
 *
 * Run with: npx tsx scripts/migrate-image-pairs.ts
 */

import { db } from '@/lib/db';
import {
  projectImages,
  projectImagePairs,
  siteImages,
  siteImagePairs,
} from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

interface OldImage {
  id: string;
  imageUrl: string;
  altTextEn: string | null;
  altTextZh: string | null;
  isBefore: boolean;
  displayOrder: number;
}

interface NewImagePair {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  displayOrder: number;
}

/**
 * Convert an array of old images to paired structure.
 * Pairs consecutive before/after images when possible.
 */
function pairImages(images: OldImage[]): NewImagePair[] {
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const pairs: NewImagePair[] = [];
  let pairOrder = 0;

  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];
    const next = sorted[i + 1];

    // Check if we can pair current "before" with next "after"
    if (current.isBefore && next && !next.isBefore) {
      // Create a paired entry
      pairs.push({
        beforeImageUrl: current.imageUrl,
        beforeAltTextEn: current.altTextEn,
        beforeAltTextZh: current.altTextZh,
        afterImageUrl: next.imageUrl,
        afterAltTextEn: next.altTextEn,
        afterAltTextZh: next.altTextZh,
        displayOrder: pairOrder++,
      });
      i += 2; // Skip both
    } else if (current.isBefore) {
      // Before-only entry
      pairs.push({
        beforeImageUrl: current.imageUrl,
        beforeAltTextEn: current.altTextEn,
        beforeAltTextZh: current.altTextZh,
        afterImageUrl: null,
        afterAltTextEn: null,
        afterAltTextZh: null,
        displayOrder: pairOrder++,
      });
      i += 1;
    } else {
      // After-only entry (or regular image treated as "after")
      pairs.push({
        beforeImageUrl: null,
        beforeAltTextEn: null,
        beforeAltTextZh: null,
        afterImageUrl: current.imageUrl,
        afterAltTextEn: current.altTextEn,
        afterAltTextZh: current.altTextZh,
        displayOrder: pairOrder++,
      });
      i += 1;
    }
  }

  return pairs;
}

async function migrateProjectImages() {
  console.log('Migrating project images to pairs...');

  // Get all projects with images
  const allProjectImages = await db
    .select()
    .from(projectImages)
    .orderBy(asc(projectImages.projectId), asc(projectImages.displayOrder));

  // Group by project
  const byProject = new Map<string, OldImage[]>();
  for (const img of allProjectImages) {
    const arr = byProject.get(img.projectId) ?? [];
    arr.push(img);
    byProject.set(img.projectId, arr);
  }

  let totalProjects = 0;
  let totalPairs = 0;

  for (const [projectId, images] of byProject) {
    const pairs = pairImages(images);
    if (pairs.length > 0) {
      await db.insert(projectImagePairs).values(
        pairs.map((p) => ({
          projectId,
          beforeImageUrl: p.beforeImageUrl,
          beforeAltTextEn: p.beforeAltTextEn,
          beforeAltTextZh: p.beforeAltTextZh,
          afterImageUrl: p.afterImageUrl,
          afterAltTextEn: p.afterAltTextEn,
          afterAltTextZh: p.afterAltTextZh,
          displayOrder: p.displayOrder,
        }))
      );
      totalPairs += pairs.length;
    }
    totalProjects++;
  }

  console.log(`  Migrated ${totalProjects} projects with ${totalPairs} image pairs.`);
}

async function migrateSiteImages() {
  console.log('Migrating site images to pairs...');

  // Get all site images
  const allSiteImages = await db
    .select()
    .from(siteImages)
    .orderBy(asc(siteImages.siteId), asc(siteImages.displayOrder));

  // Group by site
  const bySite = new Map<string, OldImage[]>();
  for (const img of allSiteImages) {
    const arr = bySite.get(img.siteId) ?? [];
    arr.push(img);
    bySite.set(img.siteId, arr);
  }

  let totalSites = 0;
  let totalPairs = 0;

  for (const [siteId, images] of bySite) {
    const pairs = pairImages(images);
    if (pairs.length > 0) {
      await db.insert(siteImagePairs).values(
        pairs.map((p) => ({
          siteId,
          beforeImageUrl: p.beforeImageUrl,
          beforeAltTextEn: p.beforeAltTextEn,
          beforeAltTextZh: p.beforeAltTextZh,
          afterImageUrl: p.afterImageUrl,
          afterAltTextEn: p.afterAltTextEn,
          afterAltTextZh: p.afterAltTextZh,
          displayOrder: p.displayOrder,
        }))
      );
      totalPairs += pairs.length;
    }
    totalSites++;
  }

  console.log(`  Migrated ${totalSites} sites with ${totalPairs} image pairs.`);
}

async function verifyMigration() {
  console.log('\nVerification:');

  // Count old vs new
  const oldProjectCount = await db.select().from(projectImages);
  const newProjectPairs = await db.select().from(projectImagePairs);
  console.log(`  Project images: ${oldProjectCount.length} old -> ${newProjectPairs.length} pairs`);

  const oldSiteCount = await db.select().from(siteImages);
  const newSitePairs = await db.select().from(siteImagePairs);
  console.log(`  Site images: ${oldSiteCount.length} old -> ${newSitePairs.length} pairs`);

  // Sample check: show first few pairs
  if (newProjectPairs.length > 0) {
    console.log('\n  Sample project pairs:');
    for (const pair of newProjectPairs.slice(0, 3)) {
      const before = pair.beforeImageUrl ? 'Before: ' + pair.beforeImageUrl.slice(-30) : 'No before';
      const after = pair.afterImageUrl ? 'After: ' + pair.afterImageUrl.slice(-30) : 'No after';
      console.log(`    - ${before} | ${after}`);
    }
  }
}

async function main() {
  console.log('=== Image Pairs Migration ===\n');

  try {
    // Check if pairs tables already have data
    const existingProjectPairs = await db.select().from(projectImagePairs);
    const existingSitePairs = await db.select().from(siteImagePairs);

    if (existingProjectPairs.length > 0 || existingSitePairs.length > 0) {
      console.log('Warning: Image pairs tables already contain data.');
      console.log(`  project_image_pairs: ${existingProjectPairs.length} rows`);
      console.log(`  site_image_pairs: ${existingSitePairs.length} rows`);
      console.log('\nTo re-run migration, first clear the tables:');
      console.log('  DELETE FROM project_image_pairs;');
      console.log('  DELETE FROM site_image_pairs;');
      return;
    }

    await migrateProjectImages();
    await migrateSiteImages();
    await verifyMigration();

    console.log('\n=== Migration Complete ===');
    console.log('\nNext steps:');
    console.log('1. Verify the data in the new tables looks correct');
    console.log('2. Test the application with the new schema');
    console.log('3. Once verified, consider dropping the old tables:');
    console.log('   - project_images');
    console.log('   - site_images');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
