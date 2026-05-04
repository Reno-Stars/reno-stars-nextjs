#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Adds FAQ entries for the 4 new specialty services to all 14 locale
 * messages/{locale}/faq.json files. Build was failing with MISSING_MESSAGE
 * errors because faq.{slug}.q1..a3 keys don't exist yet for the new
 * service slugs.
 *
 * Strategy: write canonical EN content, plus native ZH content. For the
 * 12 other locales translate the EN content via the gtx free endpoint
 * (same pattern used by translate-locale-messages.mjs).
 *
 * Each service gets 3 Q&A pairs templated with {area} for city-combo
 * pages — same shape as existing service FAQs.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'];
const GTX_LOCALE_MAP = {
  'zh': 'zh-CN',
  'zh-Hant': 'zh-TW',
};

// Canonical EN content for each new service. Q2 always references {area}
// to feed the city-combo template substitution; Q1/Q3 are general.
const FAQS_EN = {
  'poly-b-replacement': {
    q1: 'How do I know if I have Poly-B plumbing?',
    a1: 'Poly-B (polybutylene) was used in Vancouver-area homes built between 1985 and 1997. The pipes are usually grey or beige plastic, branded with markings like "PB-2110" or "QEST". If your home is from that era and has plastic supply lines, there is a good chance some or all of the plumbing is Poly-B.',
    q2: 'Will my insurance cover Poly-B replacement in {area}?',
    a2: 'Most BC insurers will not pay to replace functioning Poly-B, but they will deny renewal or hike premiums until you replace it. We provide insurer-ready documentation after the {area} project completes — pressure test results, BC permit, PEX warranty — so you can return to your insurer for renewal at standard rates.',
    q3: 'Can I stay in my home during a Poly-B re-pipe?',
    a3: 'Yes. We re-pipe section by section so you have water restored at the end of each working day. Plan for short shut-offs (2-4 hours) when each fixture group is connected over to PEX. We coordinate timing with you in advance.',
  },
  'heat-pump-hvac': {
    q1: 'What heat pump rebates are available in BC right now?',
    a1: 'BC Hydro offers up to $3,000 for heat pump installations, the federal Greener Homes Grant adds up to $5,000, and income-qualified low-income households can stack an additional $3,000 BC Hydro top-up — combined potential up to $11,000. Eligibility depends on home energy audit results and income. We help with the paperwork.',
    q2: 'Will a heat pump in {area} actually keep up in winter?',
    a2: 'Modern cold-climate heat pumps maintain full heating capacity down to -25°C — well below {area} winter lows. We size the system based on your home\'s heat loss calculation, not just square footage. For homes that lose heat fast (poor insulation, lots of glazing), we add backup heat for the coldest 5-10 days per year.',
    q3: 'Can I keep my gas furnace as backup?',
    a3: 'Yes — this is called a dual-fuel or hybrid setup. The heat pump runs as the primary heat source and the gas furnace kicks in only on the coldest days. It costs more upfront but avoids the carbon-tax penalty on most heating days while keeping a backup. We recommend dual-fuel for homes that already have a working gas furnace.',
  },
  'accessible-bathroom': {
    q1: 'How much does an accessible bathroom renovation cost?',
    a1: 'Costs depend on scope: $3,000-$8,000 for safety basics (grab bars, comfort-height toilet, slip-resistant flooring), $10,000-$25,000 for a tub-to-walk-in-shower conversion, and $35,000-$60,000+ for a full wheelchair-accessible ensuite with curbless shower and roll-under vanity. We provide a detailed quote after assessing the existing space.',
    q2: 'Are accessible bathroom renovations in {area} eligible for grants?',
    a2: 'BC\'s Home Adaptation for Independence (HAFI) program covers up to $20,000 for income-qualified seniors in {area}. Veterans Affairs Canada has separate accessibility funding. We help with grant applications and provide the contractor documentation needed.',
    q3: 'Can you work with our occupational therapist?',
    a3: 'Yes — we routinely coordinate with occupational therapists when one is involved. They specify the clearances and equipment needed; we translate that into a build plan, BC Building Code compliance, and CSA B651 accessibility standard implementation.',
  },
  'critical-load-panel': {
    q1: 'Do I need a critical load panel for a backup generator?',
    a1: 'Yes — a critical load (sub-)panel separates your essential circuits from the rest of the house so the generator can power just those circuits without trying to back up the entire load. Without it, you risk overloading the generator on the first outage. The same applies to battery backup systems like Tesla Powerwall.',
    q2: 'Can I add a critical load panel without upgrading my main panel in {area}?',
    a2: 'Often yes, if your main panel has spare breaker positions and total load capacity. For pre-2000 {area} homes with 100A service that already run heat pumps, EV chargers, or large appliances, a 200A main panel upgrade is usually required first. We assess existing capacity during the on-site visit.',
    q3: 'How long does a critical load panel installation take?',
    a3: 'A standalone sub-panel installation takes 1 day. A combined main panel upgrade (100A→200A) plus sub-panel takes 2-3 days, including BC Technical Safety Authority inspection. We coordinate the temporary power shut-off with you (typically 4-6 hours during the swap).',
  },
};

// Native ZH translations (same Q&A semantics, written natively rather than
// machine-translated to match the higher-CTR ZH-side voice per project
// memory feedback_seo_translation_backfill_pattern).
const FAQS_ZH = {
  'poly-b-replacement': {
    q1: '如何判断我家是不是 Poly-B 水管？',
    a1: 'Poly-B（聚丁烯）在 1985 至 1997 年间被广泛安装在大温地区房屋中。管道通常为灰色或米色塑料，标有 "PB-2110" 或 "QEST" 字样。如您家建于那个年代且有塑料供水管，很可能有部分或全部 Poly-B 管道。',
    q2: '保险公司会承担 {area} 的 Poly-B 更换费用吗？',
    a2: '大多数 BC 保险公司不会支付未损坏 Poly-B 的更换费用，但会拒绝续保或大幅上调保费直到您更换为止。{area} 项目完成后我们提供保险公司认可的文件——压力测试结果、BC 许可证、PEX 保修——您可以凭此向保险公司续保，恢复正常费率。',
    q3: 'Poly-B 重新走管期间我能继续住在家里吗？',
    a3: '可以。我们分区域重新走管，每个工作日结束时都会恢复供水。请预留每组洁具切换到 PEX 时的短时停水（2-4 小时）。我们会提前与您协调时间。',
  },
  'heat-pump-hvac': {
    q1: '目前 BC 省有哪些热泵退税可用？',
    a1: 'BC Hydro 提供最高 $3,000 的热泵安装退税，加拿大联邦绿色家园补助再加 $5,000，符合低收入资格的家庭可叠加额外 BC Hydro $3,000——合计最高 $11,000。资格取决于入户能源审计结果和收入。我们协助办理文件。',
    q2: '热泵在 {area} 冬天真的能撑得住吗？',
    a2: '现代寒带级热泵在 -25°C 时仍能维持全制热——远低于 {area} 冬季最低气温。我们按房屋热损失计算选型，不仅按平方尺。对热损失快的房子（保温差、玻璃多），我们会针对最冷的 5-10 天加装辅热。',
    q3: '我能保留燃气炉作为备用吗？',
    a3: '可以——这叫双燃料或混合系统。热泵作为主热源，燃气炉只在最冷的日子启动。前期成本更高但避免了大部分供暖日的碳税成本，同时保留备用热源。如您家已有正常运转的燃气炉，我们推荐双燃料方案。',
  },
  'accessible-bathroom': {
    q1: '无障碍浴室改造费用是多少？',
    a1: '费用取决于范围：基础安全（扶手、舒适高度马桶、防滑地板）$3,000-$8,000；浴缸改步入式淋浴 $10,000-$25,000；带无门槛淋浴和可滚入式梳妆台的全轮椅无障碍主卫 $35,000-$60,000+。我们到现场评估后提供详细报价。',
    q2: '{area} 的无障碍浴室改造是否符合资助资格？',
    a2: 'BC 的"独立生活居家改造"(HAFI) 项目为 {area} 符合低收入资格的老人提供最高 $20,000 资助。退伍军人事务部加拿大有单独的无障碍资金。我们协助申请文件并提供承包商所需的资质文档。',
    q3: '你们可以与我们的职业治疗师协作吗？',
    a3: '可以——我们经常与介入的职业治疗师协调。他们指定所需的通道宽度和设备，我们将其转化为施工方案，确保符合 BC 建筑规范和 CSA B651 无障碍标准。',
  },
  'critical-load-panel': {
    q1: '装备用发电机需要关键负载电箱吗？',
    a1: '需要——关键负载（分）电箱将关键电路与房屋其余部分分开，发电机只为这些电路供电，不必支撑整屋负载。否则首次停电就可能让发电机过载。Tesla Powerwall 等电池备用系统同理。',
    q2: '在 {area} 不升级总电箱能加装关键负载电箱吗？',
    a2: '通常可以，前提是总电箱有空余断路器位置和总负载容量。对 2000 年前 {area} 100A 服务、已运行热泵、EV 充电器或大功率电器的房子，通常需要先升级到 200A 总电箱。我们入户时评估现有容量。',
    q3: '关键负载电箱安装需要多长时间？',
    a3: '独立分电箱安装 1 天。组合方案（100A→200A 总电箱升级 + 分电箱）需 2-3 天，含 BC 技术安全局检验。临时停电（更换时通常 4-6 小时）时间会与您协调。',
  },
};

const GTX = 'https://translate.googleapis.com/translate_a/single';

async function gtxTranslate(text, targetLocale) {
  if (!text || !text.trim()) return text;
  const target = GTX_LOCALE_MAP[targetLocale] || targetLocale;
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: text });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`${GTX}?${params}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return data[0].map((seg) => seg[0]).filter(Boolean).join('');
    } catch (e) {
      if (attempt === 2) {
        console.warn(`  gtx fail [${targetLocale}]: ${e.message}, falling back to EN`);
        return text;
      }
      await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
    }
  }
  return text;
}

async function buildLocaleFaqs(locale) {
  if (locale === 'en') return FAQS_EN;
  if (locale === 'zh') return FAQS_ZH;

  const result = {};
  for (const [slug, qa] of Object.entries(FAQS_EN)) {
    result[slug] = {};
    for (const [key, value] of Object.entries(qa)) {
      // Preserve {area} placeholder during translation by swapping with a marker
      const protectedText = value.replace(/\{area\}/g, 'XXAREAXX');
      const translated = await gtxTranslate(protectedText, locale);
      result[slug][key] = translated.replace(/XXAREAXX/g, '{area}');
      await new Promise((res) => setTimeout(res, 100));
    }
    process.stdout.write(`    ${slug}\n`);
  }
  return result;
}

async function run() {
  for (const locale of LOCALES) {
    const filePath = path.join('messages', locale, 'faq.json');
    const existing = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    process.stdout.write(`[${locale}] ...\n`);

    const newFaqs = await buildLocaleFaqs(locale);
    let added = 0;
    for (const [slug, qa] of Object.entries(newFaqs)) {
      if (existing.faq[slug]) {
        process.stdout.write(`  SKIP ${slug} (exists)\n`);
        continue;
      }
      existing.faq[slug] = qa;
      added++;
    }
    if (added > 0) {
      await fs.writeFile(filePath, JSON.stringify(existing, null, 2) + '\n');
      console.log(`  WROTE ${added} new service-FAQs`);
    } else {
      console.log(`  no changes`);
    }
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
