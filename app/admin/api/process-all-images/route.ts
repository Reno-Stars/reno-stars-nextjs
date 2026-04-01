/**
 * POST /admin/api/process-all-images
 * Batch-processes all existing R2 images to WebP variants.
 * Runs server-side where S3 credentials are available.
 *
 * Body: { force?: boolean, limit?: number }
 * Streams NDJSON progress: { done, total, slug, ok, skipped, error? }
 * Final line: { done, total, processed, skipped, errors, finished: true }
 *
 * Invoke once to backfill existing images.
 * Idempotent — skips images whose variants already exist.
 */
import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { projectImagePairs, siteImagePairs, projects as projectsTable } from '@/lib/db/schema';
import { isNotNull } from 'drizzle-orm';
import { processImage } from '@/lib/admin/image-process';

export const maxDuration = 300; // 5 min max — Vercel Pro allows up to 300s

async function getImageUrls(): Promise<string[]> {
  const s3PublicUrl = process.env.S3_PUBLIC_URL || '';
  const urls = new Set<string>();

  const [pairs, sitePairs, heroes] = await Promise.all([
    db.select({ a: projectImagePairs.afterImageUrl, b: projectImagePairs.beforeImageUrl })
      .from(projectImagePairs)
      .where(isNotNull(projectImagePairs.afterImageUrl)),
    db.select({ a: siteImagePairs.afterImageUrl, b: siteImagePairs.beforeImageUrl })
      .from(siteImagePairs)
      .where(isNotNull(siteImagePairs.afterImageUrl)),
    db.select({ h: projectsTable.heroImageUrl })
      .from(projectsTable)
      .where(isNotNull(projectsTable.heroImageUrl)),
  ]);

  for (const row of [...pairs, ...sitePairs]) {
    if (row.a && row.a.startsWith(s3PublicUrl)) urls.add(row.a);
    if (row.b && row.b.startsWith(s3PublicUrl)) urls.add(row.b);
  }
  for (const row of heroes) {
    if (row.h && row.h.startsWith(s3PublicUrl)) urls.add(row.h);
  }

  return Array.from(urls).filter(u => u.match(/\.(jpg|jpeg|png|webp|gif)$/i));
}

export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let force = false;
  let limit = Infinity;
  try {
    const body = await request.json();
    force = body.force === true;
    limit = typeof body.limit === 'number' ? body.limit : Infinity;
  } catch { /* no body is fine */ }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };

      try {
        let urls = await getImageUrls();
        const total = Math.min(urls.length, limit === Infinity ? urls.length : limit);
        if (limit < urls.length) urls = urls.slice(0, limit);

        send({ total, message: `Found ${total} images to process` });

        let done = 0, processed = 0, skipped = 0, errors = 0;
        const CONCURRENCY = 2; // conservative — sharp is memory-intensive

        for (let i = 0; i < urls.length; i += CONCURRENCY) {
          const batch = urls.slice(i, i + CONCURRENCY);
          await Promise.all(batch.map(async (url) => {
            const slug = url.split('/').slice(-1)[0];
            try {
              const result = await processImage(url, force);
              done++;
              if (result.skipped) { skipped++; send({ done, total, slug, skipped: true }); }
              else if (result.ok) { processed++; send({ done, total, slug, ok: true, variants: result.variants.length }); }
              else { errors++; send({ done, total, slug, ok: false, error: result.error }); }
            } catch (e) {
              done++;
              errors++;
              send({ done, total, slug, ok: false, error: String(e) });
            }
          }));
        }

        send({ done, total, processed, skipped, errors, finished: true });
      } catch (e) {
        send({ error: String(e), finished: true });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
