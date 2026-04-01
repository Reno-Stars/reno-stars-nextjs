/**
 * process-all-images.ts
 *
 * One-time script to generate WebP variants for all existing R2 images.
 * After this runs, /api/image will no longer be called for these images.
 *
 * Run with:
 *   DATABASE_URL=... S3_ENDPOINT=... S3_ACCESS_KEY=... S3_SECRET_KEY=... S3_BUCKET=... S3_PUBLIC_URL=... \
 *   pnpm tsx scripts/process-all-images.ts
 *
 * Options:
 *   --force    Re-process even if variants already exist
 *   --dry-run  Just list images, don't process
 *   --limit N  Only process N images (for testing)
 */

import { Pool } from 'pg';
import { processImage, areVariantsProcessed } from '../lib/admin/image-process';

const CONCURRENCY = 3; // parallel sharp processes (memory-intensive)
const DELAY_MS = 200;  // ms between batches

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const LIMIT = (() => {
  const idx = args.indexOf('--limit');
  return idx !== -1 ? parseInt(args[idx + 1]) : Infinity;
})();

async function getImageUrls(pool: Pool): Promise<string[]> {
  const urls = new Set<string>();
  const s3PublicUrl = process.env.S3_PUBLIC_URL || '';

  const queries = [
    pool.query(`SELECT after_image_url, before_image_url FROM project_image_pairs WHERE after_image_url IS NOT NULL`),
    pool.query(`SELECT after_image_url, before_image_url FROM site_image_pairs WHERE after_image_url IS NOT NULL`),
    pool.query(`SELECT hero_image_url FROM projects WHERE hero_image_url IS NOT NULL`),
    pool.query(`SELECT logo_url, hero_image_url FROM company_info WHERE logo_url IS NOT NULL OR hero_image_url IS NOT NULL`),
    pool.query(`SELECT image_url FROM designs WHERE image_url IS NOT NULL`),
  ];

  const results = await Promise.all(queries);

  for (const res of results) {
    for (const row of res.rows) {
      for (const val of Object.values(row) as (string | null)[]) {
        if (val && typeof val === 'string' && val.startsWith(s3PublicUrl) && val.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
          urls.add(val);
        }
      }
    }
  }

  return Array.from(urls);
}

async function processBatch(urls: string[], start: number, total: number, done: { count: number; skipped: number; errors: number }) {
  await Promise.all(urls.map(async (url) => {
    done.count++;
    const label = `[${done.count}/${total}]`;

    if (DRY_RUN) {
      console.log(`  ${label} DRY-RUN: ${url.slice(-60)}`);
      return;
    }

    try {
      const result = await processImage(url, FORCE);
      if (result.skipped) {
        done.skipped++;
        process.stdout.write(`  ✓ ${label} SKIP (already processed)\r`);
      } else if (result.ok) {
        const totalKb = result.variants.reduce((s, v) => s + v.bytes, 0) / 1024;
        console.log(`  ✓ ${label} OK — ${result.variants.length} variants, ${Math.round(totalKb)}KB total | ${url.slice(-50)}`);
      } else {
        done.errors++;
        console.log(`  ✗ ${label} ERR — ${result.error} | ${url.slice(-50)}`);
      }
    } catch (e) {
      done.errors++;
      console.log(`  ✗ ${label} THROW — ${e} | ${url.slice(-50)}`);
    }
  }));
}

async function main() {
  console.log('🖼  Processing all R2 images to WebP variants...');
  console.log(`   Force: ${FORCE}, Dry-run: ${DRY_RUN}, Limit: ${LIMIT === Infinity ? 'none' : LIMIT}`);
  console.log(`   S3_PUBLIC_URL: ${process.env.S3_PUBLIC_URL || '(not set)'}\n`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    let urls = await getImageUrls(pool);
    console.log(`📸 Found ${urls.length} unique source images in R2`);

    if (LIMIT < urls.length) {
      console.log(`   Limiting to first ${LIMIT} images`);
      urls = urls.slice(0, LIMIT);
    }

    if (urls.length === 0) {
      console.log('   Nothing to process.');
      return;
    }

    const done = { count: 0, skipped: 0, errors: 0 };
    const total = urls.length;

    for (let i = 0; i < total; i += CONCURRENCY) {
      const batch = urls.slice(i, i + CONCURRENCY);
      await processBatch(batch, i, total, done);
      if (DELAY_MS > 0 && i + CONCURRENCY < total) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    console.log(`\n✅ Done!`);
    console.log(`   Processed: ${done.count - done.skipped - done.errors}`);
    console.log(`   Skipped (already existed): ${done.skipped}`);
    console.log(`   Errors: ${done.errors}`);
  } finally {
    await pool.end();
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
