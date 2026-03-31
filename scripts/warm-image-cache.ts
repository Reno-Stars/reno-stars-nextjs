/**
 * warm-image-cache.ts
 *
 * Pre-warms the /api/image CDN cache for all project images after deploy.
 * Run with: pnpm warm:images
 *
 * This ensures no real visitor ever hits a cold image load.
 * Each URL is requested at common breakpoints (828, 1200) so Vercel's
 * CDN caches the optimized WebP for all subsequent visitors.
 */

import { Pool } from 'pg';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.reno-stars.com';
const DB_URL = process.env.DATABASE_URL!;
const WIDTHS = [828, 1200];
const QUALITY = 70;
const CONCURRENCY = 5; // parallel requests
const DELAY_MS = 50;   // ms between batches

async function getImageUrls(pool: Pool): Promise<string[]> {
  const urls = new Set<string>();

  // Project image pairs (before + after)
  const pairs = await pool.query(`
    SELECT after_image_url, before_image_url 
    FROM project_image_pairs 
    WHERE after_image_url IS NOT NULL
  `);
  for (const row of pairs.rows) {
    if (row.after_image_url) urls.add(row.after_image_url);
    if (row.before_image_url) urls.add(row.before_image_url);
  }

  // Site image pairs
  const sitePairs = await pool.query(`
    SELECT after_image_url, before_image_url 
    FROM site_image_pairs 
    WHERE after_image_url IS NOT NULL
  `);
  for (const row of sitePairs.rows) {
    if (row.after_image_url) urls.add(row.after_image_url);
    if (row.before_image_url) urls.add(row.before_image_url);
  }

  // Project hero images
  const projects = await pool.query(`
    SELECT hero_image_url FROM projects WHERE hero_image_url IS NOT NULL
  `);
  for (const row of projects.rows) {
    urls.add(row.hero_image_url);
  }

  return Array.from(urls).filter(u => u.startsWith('http'));
}

function buildOptimizedUrl(src: string, width: number): string {
  return `${BASE_URL}/api/image/?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}&f=webp`;
}

async function warmUrl(url: string): Promise<{ url: string; status: number; time: number; cached: boolean }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'GET' });
    const time = Date.now() - start;
    const cached = res.headers.get('x-vercel-cache') === 'HIT' || res.headers.get('x-cache') === 'HIT';
    return { url, status: res.status, time, cached };
  } catch (e) {
    return { url, status: 0, time: Date.now() - start, cached: false };
  }
}

async function warmBatch(urls: string[]): Promise<void> {
  const results = await Promise.all(urls.map(warmUrl));
  for (const r of results) {
    const icon = r.status === 200 ? (r.cached ? '✓ HIT' : '→ MISS') : '✗ ERR';
    console.log(`  ${icon} ${r.time}ms ${r.url.substring(0, 100)}`);
  }
}

async function main() {
  console.log('🔥 Warming image cache...');
  console.log(`   Base URL: ${BASE_URL}`);

  const pool = new Pool({ connectionString: DB_URL });

  try {
    const imageUrls = await getImageUrls(pool);
    console.log(`\n📸 Found ${imageUrls.length} unique source images`);

    // Build all URLs to warm (each image × each width)
    const warmUrls: string[] = [];
    for (const src of imageUrls) {
      for (const width of WIDTHS) {
        warmUrls.push(buildOptimizedUrl(src, width));
      }
    }

    console.log(`🚀 Warming ${warmUrls.length} URLs (${imageUrls.length} images × ${WIDTHS.length} widths)\n`);

    let done = 0;
    let hits = 0;
    let errors = 0;

    // Process in batches
    for (let i = 0; i < warmUrls.length; i += CONCURRENCY) {
      const batch = warmUrls.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(warmUrl));

      for (const r of results) {
        done++;
        if (r.status === 200 && r.cached) hits++;
        if (r.status !== 200) errors++;

        const icon = r.status === 200 ? (r.cached ? '✓' : '→') : '✗';
        process.stdout.write(`  ${icon} [${done}/${warmUrls.length}] ${r.time}ms\r`);
      }

      if (DELAY_MS > 0 && i + CONCURRENCY < warmUrls.length) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    console.log(`\n\n✅ Done!`);
    console.log(`   Total: ${done} URLs`);
    console.log(`   CDN hits: ${hits} (already cached)`);
    console.log(`   Warmed: ${done - hits - errors} (newly cached)`);
    console.log(`   Errors: ${errors}`);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
