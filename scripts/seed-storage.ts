import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

// ---------------------------------------------------------------------------
// S3 API config — separate from the public URL (NEXT_PUBLIC_STORAGE_PROVIDER)
//
// S3_ENDPOINT — S3 API endpoint (e.g. https://xxx.r2.cloudflarestorage.com)
// S3_BUCKET   — bucket name (e.g. reno-stars)
// S3_ACCESS_KEY / S3_SECRET_KEY — credentials
// ---------------------------------------------------------------------------
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET = process.env.S3_BUCKET;

if (!S3_ENDPOINT || !BUCKET) {
  console.error('Error: S3_ENDPOINT and S3_BUCKET must be set in .env.local');
  console.error('Example:');
  console.error('  S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com');
  console.error('  S3_BUCKET=reno-stars');
  process.exit(1);
}

const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY ?? '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY ?? '';

if (!S3_ACCESS_KEY || !S3_SECRET_KEY) {
  console.error('Error: S3_ACCESS_KEY and S3_SECRET_KEY must be set in .env.local');
  process.exit(1);
}

// Remote assets — downloaded from production and uploaded to storage
const REMOTE_ASSETS = [
  'https://reno-stars.com/wp-content/uploads/2024/04/reno-stars-1-e1752023284333-1024x294.jpg',
  'https://reno-stars.com/wp-content/uploads/2024/07/Untitled-design-1.mp4',
  'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/15.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/16.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/340.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/35.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/49.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/52.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/53.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/71.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/73.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png',
  'https://reno-stars.com/wp-content/uploads/2025/04/84.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/bright-and-cozy-dining-living-room.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/brightened-whole-house-renovation-living-room.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg',
  'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg',
];

// Local assets — read from disk and uploaded to storage
// { localPath: relative to project root, key: object key in bucket }
const LOCAL_ASSETS = [
  { localPath: 'public/logo.jpg', key: 'logo.jpg' },
];

const WP_PREFIX = '/wp-content/uploads/';

function urlToKey(url: string): string {
  const idx = url.indexOf(WP_PREFIX);
  if (idx === -1) throw new Error(`Unexpected URL format: ${url}`);
  return 'uploads/' + url.slice(idx + WP_PREFIX.length);
}

function contentType(key: string): string {
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.webp')) return 'image/webp';
  if (key.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

async function objectExists(s3: S3Client, key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

const MAX_RETRIES = 3;

async function retry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      const delay = attempt * 2000;
      console.log(`  RETRY ${label} (attempt ${attempt}/${MAX_RETRIES}, waiting ${delay / 1000}s...)`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

async function uploadObject(s3: S3Client, key: string, body: Buffer): Promise<void> {
  await retry(
    () =>
      s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: body,
          ContentType: contentType(key),
        })
      ),
    key
  );
}

async function main() {
  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: 'auto',
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  const totalCount = REMOTE_ASSETS.length + LOCAL_ASSETS.length;
  console.log(`Seeding ${totalCount} assets into ${S3_ENDPOINT}/${BUCKET}...\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  // Upload local files
  for (const { localPath, key } of LOCAL_ASSETS) {
    try {
      if (await objectExists(s3, key)) {
        console.log(`  SKIP  ${key} (already exists)`);
        skipped++;
        continue;
      }

      const filePath = resolve(localPath);
      console.log(`  READ  ${localPath}`);
      const body = readFileSync(filePath);
      await uploadObject(s3, key, body);
      console.log(`  PUT   ${key} (${(body.length / 1024).toFixed(0)} KB)`);
      uploaded++;
    } catch (err) {
      console.error(`  FAIL  ${key}: ${(err as Error).message}`);
      failed++;
    }
  }

  // Download and upload remote assets
  for (const url of REMOTE_ASSETS) {
    const key = urlToKey(url);

    try {
      if (await objectExists(s3, key)) {
        console.log(`  SKIP  ${key} (already exists)`);
        skipped++;
        continue;
      }

      console.log(`  DOWN  ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  FAIL  ${url} → HTTP ${response.status}`);
        failed++;
        continue;
      }

      const body = Buffer.from(await response.arrayBuffer());
      await uploadObject(s3, key, body);
      console.log(`  PUT   ${key} (${(body.length / 1024).toFixed(0)} KB)`);
      uploaded++;
    } catch (err) {
      console.error(`  FAIL  ${key}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nDone — ${uploaded} uploaded, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Storage seed failed:', err);
  process.exit(1);
});
