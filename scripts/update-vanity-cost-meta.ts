/**
 * 2026-05-07 zero-CTR snippet rewrite for /en/blog/vanity-renovation-cost-vancouver/.
 *
 * GSC: "vanity renovation cost" — 762 impressions, position 3.89, 0 clicks
 * across the last 30 days. Page-1 ranking, but AI Overview / featured snippet
 * is eating the click. Sharpened EN meta_title + meta_description to lead with
 * concrete recent-project numbers and a low-friction CTA the AI summary can't
 * replicate.
 *
 * Run:
 *   DATABASE_URL=... pnpm tsx scripts/update-vanity-cost-meta.ts
 *
 * (Production deploy must follow — admin webhook → Vercel rebuild — to surface
 * the new <title>/<meta description>. Marketing pages are SSG since 2026-05-04.)
 */
import { Pool } from 'pg';

const SLUG = 'vanity-renovation-cost-vancouver';

// EN-only update — ZH (and other locales) untouched per the SEO sprint scope.
const META_TITLE_EN =
  'Vanity Renovation Cost Vancouver 2026: $700–$7,200 Real Data';
const META_DESCRIPTION_EN =
  'Real Vancouver vanity costs from recent projects: $700 stock single, $1,500 stock double, $7,200+ custom double. Free quote on yours in 48h.';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  try {
    const before = await pool.query(
      'SELECT slug, meta_title_en, meta_description_en FROM blog_posts WHERE slug = $1',
      [SLUG],
    );
    if (before.rows.length === 0) {
      console.error(`No row found for slug=${SLUG}`);
      process.exit(1);
    }
    console.log('Before:', before.rows[0]);

    const r = await pool.query(
      `UPDATE blog_posts
         SET meta_title_en = $2,
             meta_description_en = $3,
             updated_at = NOW()
       WHERE slug = $1
       RETURNING slug, meta_title_en, meta_description_en, updated_at`,
      [SLUG, META_TITLE_EN, META_DESCRIPTION_EN],
    );
    console.log('After:', r.rows[0]);
  } finally {
    await pool.end();
  }
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
