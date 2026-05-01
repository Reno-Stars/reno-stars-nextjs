#!/usr/bin/env node
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { neon } from '@neondatabase/serverless';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const env = JSON.parse(
  fs.readFileSync(process.env.HOME + '/reno-star-business-intelligent/config/env.json', 'utf8'),
) as { services: { neon_db: string; r2_access_key: string; r2_secret_key: string } };
const sql = neon(env.services.neon_db);

const dotenv = fs.readFileSync(
  '/Users/renostars/.openclaw/workspace/reno-stars-nextjs-prod/.env.production.local',
  'utf8',
);
const E: Record<string, string> = Object.fromEntries(
  dotenv
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const [k, ...rest] = l.split('=');
      return [k, rest.join('=').replace(/^"|"$/g, '')];
    }),
);

// .env.production.local R2 keys are pre-rotation (2026-04-09). Use the freshly
// rotated keys from env.json. Endpoint/bucket/public-url stay from .env file.
E.S3_ACCESS_KEY = env.services.r2_access_key;
E.S3_SECRET_KEY = env.services.r2_secret_key;

const S3_ENDPOINT = E.S3_ENDPOINT;
const S3_BUCKET = E.S3_BUCKET;
const S3_PUBLIC_URL = E.S3_PUBLIC_URL;

// seed-storage.ts uses S3_ENDPOINT *as-is* (with /reno-stars in path) and
// forcePathStyle: true with Bucket: 'reno-stars'. Match that exactly.
const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: 'auto',
  credentials: { accessKeyId: E.S3_ACCESS_KEY, secretAccessKey: E.S3_SECRET_KEY },
  forcePathStyle: true,
});

const SLUG = 'west-vancouver-luxury-bathroom-champagne-gold';
const PO = '7180';
const SOURCE_DIR = '/Users/renostars/Downloads/social media for 7180';

interface ImagePlan {
  src: string;
  label: string;
  alt: string;
  hero?: boolean;
  isBefore?: boolean;
}

// Image plan: hero + after gallery + before pairs
// Source files numbered 172-184; 181 + 184 are clearly "Before" shots
// (visible "Before" text overlay + yellow markers)
const IMAGES: ImagePlan[] = [
  { src: 'Image_20260501144851_173_9.jpg', label: 'after-tub-1', hero: true, alt: 'Champagne gold tub area with cream marble and garden view — West Vancouver luxury bathroom' },
  { src: 'Image_20260501144844_172_9.jpg', label: 'after-tub-mirror', alt: 'Ornate gold-framed wall mirror over marble bathtub with plantation shutters' },
  { src: 'Image_20260501144900_176_9.jpg', label: 'after-shower-1', alt: 'Frameless glass walk-in shower with champagne gold rain head and basketweave marble mosaic floor' },
  { src: 'Image_20260501144855_174_9.jpg', label: 'after-shower-2', alt: 'Walk-in shower with champagne gold fixtures and built-in marble bench' },
  { src: 'Image_20260501144858_175_9.jpg', label: 'after-shower-niche', alt: 'Marble shower wall with backlit champagne gold trimmed niche' },
  { src: 'Image_20260501144904_177_9.jpg', label: 'after-vanity-1', alt: 'Double-sink French-style vanity with arched ceiling and champagne gold faucets' },
  { src: 'Image_20260501144906_178_9.jpg', label: 'after-vanity-2', alt: 'Brass sconces flanking arched mirror over double vanity in West Vancouver luxury bath' },
  { src: 'Image_20260501144909_179_9.jpg', label: 'after-arched-mirror', alt: 'Champagne gold arched dressing mirror with vintage brass wall sconces' },
  { src: 'Image_20260501144912_180_9.jpg', label: 'after-detail', alt: 'Cream marble bathroom detail with champagne gold accents and European design' },
  { src: 'Image_20260501144918_182_9.jpg', label: 'after-room', alt: 'Wide angle of completed European-style luxury bathroom in West Vancouver' },
  { src: 'Image_20260501144921_183_9.jpg', label: 'after-final', alt: 'Reno Stars luxury bathroom renovation finished in champagne gold and cream marble' },
  { src: 'Image_20260501144915_181_9.jpg', label: 'before-shower', isBefore: true, alt: 'Original 1990s shower with floral wallpaper and gold-framed door — before renovation' },
  { src: 'Image_20260501144924_184_9.jpg', label: 'before-tub', isBefore: true, alt: 'Original soaker tub with damask wallpaper and dated finishes — before renovation' },
];

async function processAndUpload(srcPath: string, key: string): Promise<string> {
  const buf = await sharp(srcPath)
    .rotate()
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buf,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return `${S3_PUBLIC_URL}/${key.replace(/^reno-stars\//, '')}`;
}

interface UploadedImage extends ImagePlan {
  url: string;
}

interface ProjectRow {
  id: string;
  slug: string;
}

(async () => {
  const SITE_ID = '64f0f111-4920-434f-ab7e-0c2c411e6633'; // individual-projects
  const SERVICE_ID = '69735a93-2612-4b02-852c-c7d3db509234'; // bathroom

  const existing = (await sql`SELECT slug FROM projects WHERE slug = ${SLUG}`) as unknown as Array<{ slug: string }>;
  if (existing.length) {
    console.error('!! slug already exists, aborting:', SLUG);
    process.exit(1);
  }

  console.log('Uploading 13 images...');
  const uploaded: UploadedImage[] = [];
  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    const srcPath = path.join(SOURCE_DIR, img.src);
    const key = `uploads/admin/${SLUG}-${img.label}.jpg`;
    process.stdout.write(`  [${i + 1}/${IMAGES.length}] ${img.label}... `);
    const url = await processAndUpload(srcPath, key);
    uploaded.push({ ...img, url });
    process.stdout.write('ok\n');
  }

  const heroEntry = uploaded.find((u) => u.hero);
  if (!heroEntry) throw new Error('no hero entry in IMAGES');
  const heroUrl = heroEntry.url;
  const afterShots = uploaded.filter((u) => !u.isBefore);

  function findByLabel(label: string): UploadedImage {
    const r = uploaded.find((u) => u.label === label);
    if (!r) throw new Error(`missing image label ${label}`);
    return r;
  }

  const PAIRS = [
    {
      title_en: 'Master Tub Area: Cream Marble + Champagne Gold',
      title_zh: '主卫浴缸区：奶油大理石 + 香槟金',
      caption_en: 'Original soaker tub kept and reframed in cream marble. Re-tiled walls, champagne gold faucet + grab bar, plantation shutters retained for the garden + pool view.',
      caption_zh: '保留原有按摩浴缸，用奶油大理石重新包边。整墙重铺大理石，换上香槟金龙头和扶手；保留原有百叶窗，让花园和泳池景色不变。',
      before: findByLabel('before-tub').url,
      before_alt_en: findByLabel('before-tub').alt,
      after: findByLabel('after-tub-mirror').url,
      after_alt_en: findByLabel('after-tub-mirror').alt,
    },
    {
      title_en: 'Walk-in Shower: Frameless Glass + Champagne Gold Rain Head',
      title_zh: '步入式淋浴：双人无框玻璃 + 香槟金顶喷',
      caption_en: 'Replaced the gold-framed sliding door with a fully frameless glass enclosure. Top rain shower + handheld + slide bar, internal quartz bench, niche trimmed in champagne gold metal edge, basketweave marble mosaic floor.',
      caption_zh: '拆除金色铝框淋浴房，换成整块通透无框玻璃。顶喷+手持+滑杆花洒齐全，内置石英石坐凳；壁龛加香槟金金属收边条，地面 Basketweave 大理石马赛克。',
      before: findByLabel('before-shower').url,
      before_alt_en: findByLabel('before-shower').alt,
      after: findByLabel('after-shower-1').url,
      after_alt_en: findByLabel('after-shower-1').alt,
    },
  ];

  const description_en =
    "A West Side Vancouver luxury home master bathroom transformed from 1990s damask wallpaper, gold-framed shower, and small mosaic tile into a champagne gold European-style retreat. Cream-toned marble walls run floor to ceiling, all hardware unified in champagne gold (faucet, shower set, door pulls, lighting, mirror frames, niche edge), and the original soaker tub is retained but reframed in cream marble for a modern silhouette. The shower swaps a gold-framed sliding door for a fully frameless dual-head glass enclosure with built-in quartz bench and basketweave marble mosaic floor. Twin vanity area uses a French-paneled white solid-wood double vanity with arched coffered ceiling, champagne gold hexagonal hardware, and vintage brass wall sconces for warm candlelight tones. A separate champagne gold arched dressing mirror with brass sconces frames the entry — a final ritual mirror before stepping out. The result is the kind of bathroom that turns a daily bath into a European-mansion vacation, with garden + pool views through the original plantation shutters.";
  const description_zh =
    '温哥华西区一栋老豪宅的主卫改造，从浓郁 90 年代风（满墙复古花纹壁纸、金色铝框淋浴房、贴墙大镜面、小方砖+六角砖）转身为香槟金欧式风格。整墙通铺奶油纹大理石瓷砖，所有五金统一香槟金色系——龙头、花洒、门把手、灯具、镜框、收边条；原有按摩浴缸保养完好，未拆除，改用奶油大理石重新包边，配香槟金龙头与扶手。淋浴房从金色铝框换成整块无框玻璃，配顶喷+手持+滑杆花洒、内置石英石坐凳、香槟金金属收边壁龛，以及 Basketweave 大理石马赛克地面。双人台盆区采用拱形吊顶+嵌入式筒灯、整面镜墙、法式护墙板风格白色实木双人台盆、香槟金六边形把手、香槟金广式龙头、两侧复古黄铜壁灯（温柔烛光色）。入口处加一面香槟金拱形穿衣镜，搭配黄铜壁灯。开窗就是花园和泳池——把每天泡澡变成欧洲庄园式度假。';
  const excerpt_en =
    'Champagne gold European-style luxury bathroom renovation in West Side Vancouver. Cream marble, frameless glass shower with built-in bench, French-paneled double vanity with arched ceiling, retained original tub reframed in marble, all-brass champagne gold hardware throughout. ~4-6 week build.';
  const excerpt_zh =
    '温哥华西区豪宅香槟金欧式风格主卫翻新。奶油大理石、双人无框玻璃淋浴房、拱形吊顶法式双人台盆、保留原有浴缸用大理石重新包边，全屋香槟金五金统一，工期约 4-6 周。';
  const tags_en =
    'champagne gold, european style, french luxury, cream marble, basketweave mosaic, frameless shower, double vanity, arched ceiling, brass sconces, west vancouver, luxury bathroom, master bath, marble walls, plantation shutters';

  // 70-char meta_title cap
  const meta_title_en = 'Champagne Gold Luxury Bathroom — West Side Vancouver | Reno Stars';
  const meta_title_zh = '温哥华西区豪宅香槟金欧式浴室翻新 | Reno Stars';
  // 155-char meta_description cap
  const meta_desc_en =
    'West Side Vancouver luxury bath: cream marble, frameless glass shower, french-paneled double vanity, champagne gold hardware throughout. 4-6 wk build.';
  const meta_desc_zh = '温哥华西区豪宅主卫翻新：奶油大理石通铺、双人无框玻璃淋浴、法式拱顶双人台盆、全屋香槟金五金。工期 4-6 周。';

  console.log('\nInserting project row...');
  const inserted = (await sql`
    INSERT INTO projects (
      slug, title_en, title_zh,
      description_en, description_zh,
      excerpt_en, excerpt_zh,
      service_id, service_type,
      category_en, category_zh,
      location_city,
      duration_en, duration_zh,
      space_type_en, space_type_zh,
      hero_image_url,
      badge_en, badge_zh,
      featured, is_published, published_at,
      site_id, display_order_in_site,
      meta_title_en, meta_title_zh,
      meta_description_en, meta_description_zh,
      seo_keywords_en,
      po_number
    )
    VALUES (
      ${SLUG}, ${'Champagne Gold European Luxury Bathroom — West Side Vancouver'}, ${'香槟金欧式豪华浴室 — 温哥华西区'},
      ${description_en}, ${description_zh},
      ${excerpt_en}, ${excerpt_zh},
      ${SERVICE_ID}, ${'bathroom'},
      ${'Bathroom Renovation'}, ${'浴室翻新'},
      ${'Vancouver'},
      ${'4-6 weeks'}, ${'4-6 周'},
      ${'Luxury Home'}, ${'豪宅'},
      ${heroUrl},
      ${'Champagne Gold European'}, ${'香槟金欧式'},
      ${false}, ${true}, ${new Date()},
      ${SITE_ID}, ${0},
      ${meta_title_en}, ${meta_title_zh},
      ${meta_desc_en}, ${meta_desc_zh},
      ${tags_en},
      ${PO}
    )
    RETURNING id, slug
  `) as unknown as ProjectRow[];
  const project = inserted[0];
  console.log('  inserted project id:', project.id, '|', project.slug);

  console.log('\nInserting image pairs...');
  let order = 0;
  for (const pair of PAIRS) {
    await sql`
      INSERT INTO project_image_pairs (
        project_id,
        before_image_url, before_alt_text_en, before_alt_text_zh,
        after_image_url, after_alt_text_en, after_alt_text_zh,
        title_en, title_zh, caption_en, caption_zh,
        keywords, display_order
      )
      VALUES (
        ${project.id},
        ${pair.before}, ${pair.before_alt_en}, ${pair.before_alt_en},
        ${pair.after}, ${pair.after_alt_en}, ${pair.after_alt_en},
        ${pair.title_en}, ${pair.title_zh}, ${pair.caption_en}, ${pair.caption_zh},
        ${tags_en}, ${order++}
      )
    `;
    console.log('  pair:', pair.title_en);
  }

  const additionalAfters = afterShots.filter((s) => !s.hero && !PAIRS.some((p) => p.after === s.url));
  for (const a of additionalAfters) {
    await sql`
      INSERT INTO project_image_pairs (
        project_id,
        after_image_url, after_alt_text_en, after_alt_text_zh,
        title_en, title_zh, caption_en, caption_zh,
        keywords, display_order
      )
      VALUES (
        ${project.id},
        ${a.url}, ${a.alt}, ${a.alt},
        ${'Reno Stars West Vancouver — ' + a.label.replace(/^after-/, '')},
        ${'Reno Stars 温哥华西区 — ' + a.label.replace(/^after-/, '')},
        ${a.alt}, ${a.alt},
        ${tags_en}, ${order++}
      )
    `;
  }
  console.log('  added', additionalAfters.length, 'after-only frames');

  console.log('\nDONE');
  console.log('  Project: /en/projects/' + project.slug + '/');
  console.log('  Hero:', heroUrl);
})().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('FATAL', msg);
  process.exit(1);
});
