#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Repairs renovation trade terms in the machine-translated Chinese site-visit
 * checklist. Run AFTER translate-locale-messages.mjs.
 *
 * gtx has no trade vocabulary and mistranslated terms our own crew reads:
 *   vanity          → 虚荣  ("vainglory" — the emotion)
 *   paint           → 画    ("a picture")
 *   toilet          → 洗手间 (the room, not the fixture)
 *   potlights       → 聚光灯 ("spotlights")
 *   baseboard       → 底板  ("bottom plate")
 *   island outlet   → 岛出口 ("island exit")
 *   popcorn ceiling → 爆米花 (the snack)
 *   ponywall        → 小马墙 ("little horse wall")
 *   T reducers      → 减速器 ("gearbox")
 *
 * Two passes, because each fixes a different failure:
 *   1. LABELS — exact whole-value overrides, keyed by path. Safe for short
 *      values like "画" that would be reckless as a substring rule.
 *   2. GLOSSARY — substring replacements across every string, so the same bad
 *      term is fixed in the prose (hints, checks) too. Only multi-character
 *      terms that cannot appear innocently in this file.
 *
 * Idempotent: re-running finds nothing left to change.
 */
import { promises as fs } from 'node:fs';

const LOCALES = ['zh', 'zh-Hant'];

/** path within siteVisit → corrected value, per locale. */
const LABELS = {
  zh: {
    'steps.vanity.label': '浴室柜',
    'steps.paint.label': '油漆',
    'steps.fullPaint.label': '厨房油漆',
    'steps.touchUpPaint.label': '补漆',
    'steps.toilet.label': '马桶',
    'steps.potlights.label': '筒灯',
    'steps.baseboard.label': '踢脚线',
    'steps.baseboardNew.label': '新装中密度板踢脚线',
    'steps.baseboardReinstall.label': '重新安装踢脚线',
    'steps.islandOutlet.label': '中岛插座',
    'steps.gfciOutlets.label': 'GFCI 插座',
    'steps.gfciVanity.label': 'GFCI 插座（浴室柜区）',
    'steps.gfciToilet.label': 'GFCI 插座（马桶区）',
    'steps.popcornRemoval.label': '拉毛天花铲除',
    'steps.ponywall.label': '矮墙',
    'steps.newDoorOpening.label': '新开门洞',
    'steps.tMouldings.label': 'T 型收边条与过渡条',
    'steps.quartzStep.label': '石英石门槛石',
    'steps.backsplash.label': '防溅墙',
    'steps.vanitySink.label': '浴室柜台盆',
    'steps.vanityLight.label': '浴室柜镜前灯',
    'steps.cabinets.label': '橱柜',
    'steps.bench.label': '淋浴坐台',
    'steps.cornerShelves.label': '转角置物架',
    'steps.grabBars.label': '淋浴扶手',
    'steps.showerBase.label': '瓷砖淋浴底盘',
    'steps.drywall.label': '石膏板修补',
    'names.bathroom-4piece': '四件套卫浴',
    'names.bathroom-powder-room': '客用洗手间',
    'names.bathroom-vanity-only': '仅浴室柜（洗衣房）',
    // zh/zh-Hant were translated before EN collapsed this to one placeholder;
    // gtx had swapped "{done} of {total}" into "{total} 的 {done}".
    'summary.progress': '已勾选 {count}',
  },
  'zh-Hant': {
    'steps.vanity.label': '浴室櫃',
    'steps.paint.label': '油漆',
    'steps.fullPaint.label': '廚房油漆',
    'steps.touchUpPaint.label': '補漆',
    'steps.toilet.label': '馬桶',
    'steps.potlights.label': '筒燈',
    'steps.baseboard.label': '踢腳線',
    'steps.baseboardNew.label': '新裝中密度板踢腳線',
    'steps.baseboardReinstall.label': '重新安裝踢腳線',
    'steps.islandOutlet.label': '中島插座',
    'steps.gfciOutlets.label': 'GFCI 插座',
    'steps.gfciVanity.label': 'GFCI 插座（浴室櫃區）',
    'steps.gfciToilet.label': 'GFCI 插座（馬桶區）',
    'steps.popcornRemoval.label': '拉毛天花鏟除',
    'steps.ponywall.label': '矮牆',
    'steps.newDoorOpening.label': '新開門洞',
    'steps.tMouldings.label': 'T 型收邊條與過渡條',
    'steps.quartzStep.label': '石英石門檻石',
    'steps.backsplash.label': '防濺牆',
    'steps.vanitySink.label': '浴室櫃檯盆',
    'steps.vanityLight.label': '浴室櫃鏡前燈',
    'steps.cabinets.label': '櫥櫃',
    'steps.bench.label': '淋浴坐台',
    'steps.cornerShelves.label': '轉角置物架',
    'steps.grabBars.label': '淋浴扶手',
    'steps.showerBase.label': '瓷磚淋浴底盤',
    'steps.drywall.label': '石膏板修補',
    'names.bathroom-4piece': '四件套衛浴',
    'names.bathroom-powder-room': '客用洗手間',
    'names.bathroom-vanity-only': '僅浴室櫃（洗衣房）',
    'summary.progress': '已勾選 {count}',
  },
};

/** Ordered — longest/most specific first so a later rule can't eat a fix. */
const GLOSSARY = {
  zh: [
    ['爆米花天花板', '拉毛天花'],
    ['爆米花天花', '拉毛天花'],
    ['爆米花', '拉毛天花'],
    ['虚荣', '浴室柜'],
    ['梳妆台', '浴室柜'],
    ['小马墙', '矮墙'],
    ['聚光灯', '筒灯'],
    ['GFCI网点', 'GFCI 插座'],
    ['GFCI 网点', 'GFCI 插座'],
    ['岛出口', '中岛插座'],
    ['路缘石', '门槛石'],
    ['减速器', '过渡条'],
    ['管道包装', '管道保温层'],
    ['标志石棉', '标记石棉'],
    ['后挡板', '防溅墙'],
    ['踢脚板', '踢脚线'],
  ],
  'zh-Hant': [
    ['爆米花天花板', '拉毛天花'],
    ['爆米花天花', '拉毛天花'],
    ['爆米花', '拉毛天花'],
    ['虛榮', '浴室櫃'],
    ['梳妝台', '浴室櫃'],
    ['小馬牆', '矮牆'],
    ['聚光燈', '筒燈'],
    ['GFCI網點', 'GFCI 插座'],
    ['GFCI 網點', 'GFCI 插座'],
    ['島出口', '中島插座'],
    ['路緣石', '門檻石'],
    ['減速器', '過渡條'],
    ['管道包裝', '管道保溫層'],
    ['標誌石棉', '標記石棉'],
    ['後擋板', '防濺牆'],
    ['踢腳板', '踢腳線'],
  ],
};

const setPath = (obj, path, value) => {
  const parts = path.split('.');
  const last = parts.pop();
  let node = obj;
  for (const p of parts) {
    if (!node[p]) return false;
    node = node[p];
  }
  if (!(last in node)) return false;
  const changed = node[last] !== value;
  node[last] = value;
  return changed;
};

const walkStrings = (node, fn) => {
  if (Array.isArray(node)) {
    node.forEach((v, i) => {
      if (typeof v === 'string') node[i] = fn(v);
      else if (v && typeof v === 'object') walkStrings(v, fn);
    });
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string') node[k] = fn(v);
    else if (v && typeof v === 'object') walkStrings(v, fn);
  }
};

let total = 0;
for (const locale of LOCALES) {
  const file = `messages/${locale}/siteVisit.json`;
  let raw;
  try {
    raw = await fs.readFile(file, 'utf8');
  } catch {
    console.warn(`⚠ ${file} not found — run translate-locale-messages.mjs first`);
    continue;
  }
  const json = JSON.parse(raw);
  const sv = json.siteVisit;

  let labelHits = 0;
  for (const [path, value] of Object.entries(LABELS[locale])) {
    if (setPath(sv, path, value)) labelHits += 1;
  }

  let termHits = 0;
  walkStrings(sv, (s) => {
    let out = s;
    for (const [bad, good] of GLOSSARY[locale]) {
      if (out.includes(bad)) {
        out = out.split(bad).join(good);
        termHits += 1;
      }
    }
    return out;
  });

  await fs.writeFile(file, `${JSON.stringify(json, null, 2)}\n`);
  total += labelHits + termHits;
  console.log(`${locale}: ${labelHits} label override(s), ${termHits} term replacement(s)`);
}

console.log(total === 0 ? '= nothing to fix' : `✓ ${total} correction(s) applied`);
