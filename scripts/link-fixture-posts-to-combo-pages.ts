/**
 * Inserts internal anchor links from the three fixture-cost posts (vanity /
 * bathtub / toilet) to /services/bathroom/{city}/ combo pages.
 *
 * The fixture posts each contain a "Real Vancouver {fixture} costs from
 * recent projects" section listing 4-5 city-tagged project examples. Each
 * example starts with `<strong>{City} ...</strong>` — wrap the city name in
 * an anchor pointing to the matching bathroom-city combo page.
 *
 * Effect: 3 posts × ~4 city anchors each = ~12 fresh internal links pointing
 * INTO the bathroom-city combo grid. Combo pages currently sit at pos 14-27
 * for "{service} renovation {city}" queries — these in-body anchors from
 * already-ranking fixture posts pass small but real link equity downward.
 *
 * Cities covered match the project examples I cited in each post:
 *   Yaletown    → /services/bathroom/vancouver  (Yaletown is a Vancouver nbhd)
 *   Burnaby     → /services/bathroom/burnaby
 *   Coquitlam   → /services/bathroom/coquitlam
 *   Richmond    → /services/bathroom/richmond
 *   Maple Ridge → /services/bathroom/maple-ridge
 *   West Vancouver → /services/bathroom/west-vancouver
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const cityToSlug: Record<string, string> = {
  'Yaletown': 'vancouver',
  'Burnaby': 'burnaby',
  'Coquitlam': 'coquitlam',
  'Richmond': 'richmond',
  'Maple Ridge': 'maple-ridge',
  'West Vancouver': 'west-vancouver',
};

const cityToSlugZh: Record<string, string> = {
  '耶鲁镇': 'vancouver',
  '本拿比': 'burnaby',
  '高贵林': 'coquitlam',
  '列治文': 'richmond',
  '枫树岭': 'maple-ridge',
  '西温': 'west-vancouver',
};

/**
 * Links each city's first occurrence within a `<strong>...</strong>` opening
 * tag (i.e. the project-example bullet labels). Only wraps the FIRST
 * occurrence per post to avoid over-anchoring.
 */
function injectCityLinks(html: string, mapping: Record<string, string>, locale: 'en' | 'zh'): string {
  let out = html;
  for (const [cityName, citySlug] of Object.entries(mapping)) {
    // Match the first <strong>{City} pattern. EN content has a space after
    // the city name; ZH content goes straight into the next noun with no
    // separator — so we don't anchor on a trailing space.
    //
    // Idempotency: after the first run, content reads `<strong><a ...>City</a>` —
    // the regex `<strong>{City}` no longer matches because of the inserted
    // `<a href="...">`, so re-running is a no-op.
    const escaped = cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(<strong>)(${escaped})`);
    const replacement = `$1<a href="/${locale}/services/bathroom/${citySlug}/">$2</a>`;
    out = out.replace(pattern, replacement);
  }
  return out;
}

async function run() {
  const slugs = [
    'vanity-renovation-cost-vancouver',
    'bathtub-renovation-cost-vancouver',
    'toilet-renovation-cost-vancouver',
  ];

  for (const slug of slugs) {
    const r = await pool.query(
      'SELECT content_en, content_zh FROM blog_posts WHERE slug = $1',
      [slug],
    );
    if (r.rows.length === 0) {
      console.log(`SKIP (not found): ${slug}`);
      continue;
    }
    const { content_en, content_zh } = r.rows[0];

    const newEn = injectCityLinks(content_en, cityToSlug, 'en');
    const newZh = injectCityLinks(content_zh, cityToSlugZh, 'zh');

    const enChanges = (newEn.match(/<a href="\/en\/services\/bathroom\//g) || []).length;
    const zhChanges = (newZh.match(/<a href="\/zh\/services\/bathroom\//g) || []).length;

    if (newEn === content_en && newZh === content_zh) {
      console.log(`NOOP (already linked): ${slug}`);
      continue;
    }

    await pool.query(
      'UPDATE blog_posts SET content_en = $1, content_zh = $2, updated_at = NOW() WHERE slug = $3',
      [newEn, newZh, slug],
    );
    console.log(`UPDATED ${slug}: +${enChanges} EN links, +${zhChanges} ZH links`);
  }

  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
