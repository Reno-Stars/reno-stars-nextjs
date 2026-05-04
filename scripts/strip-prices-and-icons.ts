/**
 * Set icon_url + clean (price-free) short descriptions on the 4 new
 * specialty services. Per user 2026-05-04: "remove price range for
 * them, its per customer and per situation".
 *
 * Long descriptions left intact — those have detailed cost-guide tables
 * for SEO content depth; only the card-level short description was
 * flagged.
 *
 * Idempotent: just sets canonical fields directly. Re-running has no
 * effect.
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

interface SpecialtyConfig {
  iconUrl: string;
  descEn: string;
  descZh: string;
  // Localizations regenerated via gtx for the 12 non-EN/ZH locales
  // (translate-locale-messages pattern). EN copy preserves brand glossary
  // markers (Reno Stars, BC Hydro, Poly-B, PEX, Vancouver) which the gtx
  // glossary protector keeps intact.
}

const SERVICES: Record<string, SpecialtyConfig> = {
  'poly-b-replacement': {
    iconUrl: '/icons/services/wrench.svg',
    descEn: 'Replace failing polybutylene plumbing in BC homes built 1985–1997. Insurance renewal and leak prevention.',
    descZh: '更换 1985–1997 年间在 BC 省建造的房屋中失效的 Poly-B 聚乙烯管道，保险续保、防漏水。',
  },
  'heat-pump-hvac': {
    iconUrl: '/icons/services/air-vent.svg',
    descEn: 'Replace gas furnace with heat pump. BC Hydro rebates available — we help with the paperwork.',
    descZh: '用热泵替换燃气炉，符合 BC Hydro 退税资格，我们协助办理申请文件。',
  },
  'accessible-bathroom': {
    iconUrl: '/icons/services/accessibility.svg',
    descEn: 'Aging-in-place bathroom renovations: walk-in shower, grab bars, comfort-height toilet, wheelchair access.',
    descZh: '老人/无障碍浴室改造：步入式淋浴、扶手、舒适高度马桶、轮椅通行。',
  },
  'critical-load-panel': {
    iconUrl: '/icons/services/zap.svg',
    descEn: 'Backup-power-ready electrical panel for generator, battery, or EV charger. Often paired with heat pump installs.',
    descZh: '应急电源就绪电箱，适配发电机、家庭储能或 EV 充电，常配合热泵安装一并升级。',
  },
};

// Locale → Google Translate target code + camelCase key suffix.
const LOCALES: { suffix: string; gtx: string }[] = [
  { suffix: 'ZhHant', gtx: 'zh-TW' },
  { suffix: 'Ja', gtx: 'ja' },
  { suffix: 'Ko', gtx: 'ko' },
  { suffix: 'Es', gtx: 'es' },
  { suffix: 'Pa', gtx: 'pa' },
  { suffix: 'Tl', gtx: 'tl' },
  { suffix: 'Fa', gtx: 'fa' },
  { suffix: 'Vi', gtx: 'vi' },
  { suffix: 'Ru', gtx: 'ru' },
  { suffix: 'Ar', gtx: 'ar' },
  { suffix: 'Hi', gtx: 'hi' },
  { suffix: 'Fr', gtx: 'fr' },
];

const GLOSSARY: { term: string; marker: string }[] = [
  { term: 'Reno Stars', marker: 'XQXAAYQY' },
  { term: 'BC Hydro', marker: 'XQXABYQY' },
  { term: 'Poly-B', marker: 'XQXACYQY' },
  { term: 'PEX', marker: 'XQXADYQY' },
  { term: 'Vancouver', marker: 'XQXAEYQY' },
  { term: 'BC', marker: 'XQXAFYQY' },
];
GLOSSARY.sort((a, b) => b.term.length - a.term.length);

function applyGlossary(text: string): string {
  let out = text;
  for (const { term, marker } of GLOSSARY) out = out.split(term).join(marker);
  return out;
}
function unprotectGlossary(text: string): string {
  let out = text;
  for (const { term, marker } of GLOSSARY) {
    const re = new RegExp(marker.split('').join('\\s*'), 'g');
    out = out.replace(re, term);
  }
  return out;
}

async function gtxTranslate(text: string, target: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const protected_ = applyGlossary(text);
  const params = new URLSearchParams({
    client: 'gtx', sl: 'en', tl: target, dt: 't', q: protected_,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: unknown = await r.json();
      if (!Array.isArray(data) || !Array.isArray((data as unknown[][])[0])) {
        throw new Error('unexpected gtx response');
      }
      const segs = (data as unknown[][])[0] as unknown[][];
      const translated = segs
        .map((s) => (Array.isArray(s) && typeof s[0] === 'string') ? s[0] : '')
        .filter(Boolean)
        .join('');
      return unprotectGlossary(translated);
    } catch (e) {
      if (attempt === 2) {
        console.warn(`  gtx fail [${target}]: ${(e as Error).message} — keeping EN`);
        return text;
      }
      await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    }
  }
  return text;
}

async function run() {
  for (const [slug, cfg] of Object.entries(SERVICES)) {
    console.log(`\n=== ${slug} ===`);
    console.log(`  EN: ${cfg.descEn}`);
    console.log(`  ZH: ${cfg.descZh}`);

    // Translate the cleaned EN copy to all 12 non-EN/ZH locales for the
    // localizations.descriptionXx fields. ZH-Hant translates from EN with
    // gtx target=zh-TW (Traditional). Others from EN.
    const newDescriptions: Record<string, string> = {};
    for (const { suffix, gtx } of LOCALES) {
      const key = `description${suffix}`;
      const translated = await gtxTranslate(cfg.descEn, gtx);
      newDescriptions[key] = translated;
      process.stdout.write(`  ${suffix}: ${translated.slice(0, 60)}...\n`);
      await new Promise((res) => setTimeout(res, 100));
    }

    // Pull existing localizations and merge — preserve title* and longDescription*.
    const existing = await pool.query<{ localizations: Record<string, string> | null }>(
      `SELECT localizations FROM services WHERE slug = $1`,
      [slug],
    );
    const merged = { ...(existing.rows[0]?.localizations ?? {}), ...newDescriptions };

    await pool.query(
      `UPDATE services
          SET icon_url = $1,
              description_en = $2,
              description_zh = $3,
              localizations = $4
        WHERE slug = $5`,
      [cfg.iconUrl, cfg.descEn, cfg.descZh, JSON.stringify(merged), slug],
    );
    console.log(`  ✓ updated`);
  }

  await pool.end();
  console.log('\nDone.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
