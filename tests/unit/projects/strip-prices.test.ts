import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { describe, it, expect, vi } from 'vitest';
import {
  stripPrices,
  containsPrice,
  stripLocalized,
  stripBlocksPrices,
  stripProjectPrices,
  stripSitePrices,
  SENTENCE_RULES,
  WEST_VAN_FAQ,
} from '@/lib/projects/strip-prices';

const squash = (s: string) => s.replace(/\s+/g, '');

describe('containsPrice — amount formats across the 14 locales', () => {
  it.each([
    '$25,000–$27,000', '$25,000 - $27,000', 'under $27K', '$57K–$60K', '$2.5K', 'CA$25,000', 'C$9,000', 'US$12,000',
    '2.5 万加元', '2.7 万加元', '25,000 至 27,000 加元', '23,000 加元至 25,000 加元', '32K-35K 加元', '5.7 万至 6 万加元',
    '25 000 $', '23 000 à 25 000 $', '345 000–360 000 долларов', '57 000–60 000 долларов США',
    '23.000 đến 25.000 USD', '26.000 đến 28.000 đô la', '25000 و27000 دولار', '345.000 إلى 360.000 دولار',
    '23000 تا 25000 دلاری', '۲۵۰۰۰ دلار', '٢٥٠٠٠ دولار', '25,000 डॉलर', '25,000 ਡਾਲਰ', '250 万ドル', '2500만 달러', '25,000 dólares', '25,000 dollars',
  ])('detects %s', (s) => {
    expect(containsPrice(`Text ${s} text.`)).toBe(true);
    expect(containsPrice(stripPrices(`Intro sentence. Cost ${s} here. Outro sentence.`))).toBe(false);
  });

  it.each([
    'Completed in 5–6 weeks.', '9–11 weeks from permit issuance', '4-5 months', '3-4 周内完成', '历时 4-5 个月', '9 à 11 semaines',
    'priceRange "$$"', 'Licensed, $5M CGL insurance', '拥有高达 500 万加元的 CGL 保险', 'est. 2006, 20+ years', '600 sq ft condo',
    'PO-24017', 'Call 778-960-7999', 'Unit 1203, 2026 renovation', '3-year warranty', 'Top 10 ideas',
  ])('leaves %s untouched (same reference)', (s) => {
    expect(containsPrice(s)).toBe(false);
    expect(stripPrices(s)).toBe(s);
  });
});

describe('insurance amounts are never treated as prices', () => {
  // The live site-wide company description in all 14 locales (CGL insurance amounts).
  const company: string[] = JSON.parse(readFileSync('tests/fixtures/company-insurance-copy.json', 'utf8'));
  it.each(company.map((c) => [c.slice(0, 40), c] as const))('%s… is left byte-identical', (_l, c) => {
    expect(stripPrices(c)).toBe(c);
  });
});

describe('CSV acceptance — en / zh / zh-Hant current_text → replacement (whitespace-insensitive)', () => {
  const cases: { lang: string; current: string; replacement: string }[] = JSON.parse(
    readFileSync('tests/fixtures/price-copy-cases.json', 'utf8'),
  );
  it('has the spec cases', () => expect(cases.length).toBeGreaterThanOrEqual(100));
  it.each(cases.map((c, i) => [i, c.lang, c] as const))('#%i (%s)', (_i, _l, c) => {
    expect(squash(stripPrices(c.current))).toBe(squash(c.replacement));
  });
});

describe('sentence rules', () => {
  it('cover all 11 description languages that carried a price', () => {
    expect(new Set(SENTENCE_RULES.map((r) => r.lang))).toEqual(
      new Set(['en', 'zh', 'zh-Hant', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr']),
    );
  });
  it('never output an amount and never drop a duration', () => {
    for (const r of SENTENCE_RULES) {
      expect(containsPrice(r.dst), r.dst).toBe(false);
      const dur = r.src.match(/\d+\s?[-–至到]\s?\d+\s?(?:weeks?|months?|周|週|個月|个月)/g) ?? [];
      for (const d of dur) expect(squash(r.dst)).toContain(squash(d));
    }
  });
  it('rewrite real multi-sentence copy in place (fr, ru, ar, vi)', () => {
    expect(
      stripPrices('Le projet a duré 4 à 5 mois avec un investissement de 345 000 à 360 000 $, couvrant une refonte complète de l\'intérieur. Fin.'),
    ).toBe("Le projet a duré 4 à 5 mois, couvrant une refonte complète de l'intérieur. Fin.");
    expect(stripPrices('Работая в рамках бюджета в 26 000–28 000 долларов, мы перекрасили все шкафы.')).toBe('Мы перекрасили все шкафы.');
    expect(stripPrices('امتد المشروع من 4 إلى 5 أشهر باستثمار قدره 345.000 إلى 360.000 دولار، يغطي عملية إعادة تصميم داخلي كاملة.'))
      .toBe('امتد المشروع من 4 إلى 5 أشهر، يغطي عملية إعادة تصميم داخلي كاملة.');
    expect(stripPrices('Hoàn thành trong vòng 2-3 tuần với ngân sách từ 23.000 đến 25.000 USD, việc cải tạo đã giúp doanh nghiệp.'))
      .toBe('Hoàn thành trong vòng 2-3 tuần, việc cải tạo đã giúp doanh nghiệp.');
  });
});

describe('generic fallback (copy the table does not know)', () => {
  it('removes English price clauses and keeps the rest readable', () => {
    expect(stripPrices('A new kitchen for under $30K — quartz and tile.')).toBe('A new kitchen — quartz and tile.');
    expect(stripPrices('Done in 3 weeks and a $10,000–$12,000 budget, the client moved back in.'))
      .toBe('Done in 3 weeks, the client moved back in.');
    expect(stripPrices('Working within a $9,000 budget, we retiled the shower.')).toBe('We retiled the shower.');
    expect(stripPrices('Great result. Total budget: $40,000. Timeline: 5–6 weeks.')).toBe('Great result. Timeline: 5–6 weeks.');
  });
  it('drops a whole sentence only as the last resort', () => {
    expect(stripPrices('Nice tile. Es costó 12.000 dólares en total. Fin.')).toBe('Nice tile. Fin.');
    expect(stripPrices('好看。总价 3 万加元左右。完工。')).toBe('好看。完工。');
  });
});

describe('§3.4 West Vancouver FAQ #1', () => {
  const real = {
    questionEn: 'How much does it cost to divide one bathroom into two in West Vancouver?',
    questionZh: '西温哥华把一个浴室分成两个要花多少钱？',
    answerEn:
      'This project came in at $57,000–$60,000. The budget covered framing a new partition wall, full plumbing rough-in for a second bathroom (supply lines, drain, vent stack connection), electrical for a second light circuit and GFCI outlets, floor-to-ceiling tile in both bathrooms, custom vanity cabinets, all fixtures, and District of West Vancouver building and plumbing permits. Pricing varies based on existing rough-in proximity and finish level.',
    answerZh:
      '这个项目总费用为 $57,000–$60,000。预算涵盖：新隔墙框架、第二个浴室的完整水管粗装（供水管、排水管、通风管连接）、第二路照明电路及 GFCI 插座电气施工、两个浴室从地到顶的瓷砖、定制木纹浴室柜、所有洁具，以及西温哥华市政建筑和管道许可证。实际报价因现有管道位置和装修级别不同而有差异。',
  };
  const other = { questionEn: 'How long does it take?', questionZh: '要多久？', answerEn: '9–11 weeks.', answerZh: '9–11 周。' };
  const blocks = [{ type: 'paragraph', en: 'Intro.', zh: '简介。' }, { type: 'faq', items: [real, other] }];

  it('rewrites question and answer exactly per spec, both languages', () => {
    const out = stripBlocksPrices(blocks, 'two-bathroom-renovation-west-vancouver') as typeof blocks;
    const faq = out[1] as { items: (typeof real)[] };
    expect(faq.items[0].questionEn).toBe(WEST_VAN_FAQ.questionEn);
    expect(faq.items[0].questionZh).toBe(WEST_VAN_FAQ.questionZh);
    expect(faq.items[0].answerEn).toBe(
      'The scope covered framing a new partition wall, full plumbing rough-in for a second bathroom (supply lines, drain, vent stack connection), electrical for a second light circuit and GFCI outlets, floor-to-ceiling tile in both bathrooms, custom vanity cabinets, all fixtures, and District of West Vancouver building and plumbing permits.',
    );
    expect(faq.items[0].answerZh).toBe(
      '工程涵盖：新隔墙框架、第二个浴室的完整水管粗装（供水管、排水管、通风管连接）、第二路照明电路及 GFCI 插座电气施工、两个浴室从地到顶的瓷砖、定制木纹浴室柜、所有洁具，以及西温哥华市政建筑和管道许可证。',
    );
    expect(faq.items[1]).toBe(other); // other FAQ untouched (same reference)
    expect(out[0]).toBe(blocks[0]);
  });

  it('does not rewrite the same question on another project (only amounts are filtered there)', () => {
    const out = stripBlocksPrices(blocks, 'some-other-project') as typeof blocks;
    const item = (out[1] as { items: (typeof real)[] }).items[0];
    expect(item.questionEn).toBe(real.questionEn);
    expect(containsPrice(item.answerEn + item.answerZh)).toBe(false);
  });
});

describe('row helpers', () => {
  const project = {
    slug: 'kitchen-renovation-coquitlam',
    description: {
      en: 'Intro. This budget-friendly kitchen renovation in a Coquitlam condo delivered a dramatic transformation within a $25,000–$27,000 budget.',
      zh: '无价格。',
    },
    meta_description: { en: 'Coquitlam condo kitchen renovation under $27K — fresh cabinets, quartz countertops, vinyl plank floors, and upgraded lighting. View project photos.' },
    budget_range: '$25,000 - $27,000',
    po_number: 'PO-1',
    duration: { en: '5-6 weeks' },
  };
  it('filters description / meta and leaves every other field (incl. budget_range, po_number) alone', () => {
    const out = stripProjectPrices(project);
    expect(containsPrice(JSON.stringify(out.description) + JSON.stringify(out.meta_description))).toBe(false);
    expect(out.description.zh).toBe('无价格。');
    expect(out.budget_range).toBe(project.budget_range);
    expect(out.po_number).toBe('PO-1');
    expect(out.duration).toBe(project.duration);
  });
  it('filters a site and its child projects; works on single-locale strings too', () => {
    const site = { slug: 's', description: { en: 'Done for under $50K — all rooms.' }, projects: [project] };
    const out = stripSitePrices(site);
    expect(containsPrice(JSON.stringify([out.description, out.projects[0].description]))).toBe(false);
    expect(stripLocalized('Plain.')).toBe('Plain.');
  });
});

// ---------------------------------------------------------------------------
// Route level
// ---------------------------------------------------------------------------
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => k, setRequestLocale: () => {} }));
vi.mock('@/navigation', () => ({ Link: () => null, redirect: vi.fn(), usePathname: () => '/', useRouter: () => ({}), getPathname: () => '/' }));
vi.mock('@/lib/db/queries', () => ({
  getCategorySlugs: async () => ['kitchen'],
  getCategoriesLocalized: async () => [],
  getProjectsFromDb: async () => [
    {
      slug: 'two-bathroom-renovation-burnaby',
      title: { en: 'Two Bathrooms' },
      description: { en: 'Two bathrooms.' },
      category: { en: 'Bathroom' },
      location_city: 'Burnaby',
      images: [],
      hero_image: 'https://example.com/h.jpg',
      meta_description: {
        en: 'Two-bathroom renovation in Burnaby — brushed gold fixtures, custom tiles, and modern vanities. $25K–$27K completed in 4-5 weeks. View the gallery.',
      },
    },
  ],
  getSiteBySlugFromDb: async () => null,
}));

describe('route: /projects/[slug] metadata reads filtered copy', () => {
  it('meta / og / twitter description carry no amount, keep the duration', async () => {
    const { generateMetadata } = await import('@/app/[locale]/projects/[slug]/page');
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'two-bathroom-renovation-burnaby' }) });
    const all = JSON.stringify([meta.description, meta.openGraph?.description, meta.twitter?.description]);
    expect(containsPrice(all)).toBe(false);
    expect(meta.description).toBe('Two-bathroom renovation in Burnaby — brushed gold fixtures, custom tiles, and modern vanities. Completed in 4-5 weeks. View the gallery.');
  });
});

describe('guards: filtered at every projects-route hand-off, nowhere else', () => {
  it('[slug] route filters projects (metadata + page) and the site (metadata + page)', () => {
    const src = readFileSync('app/[locale]/projects/[slug]/page.tsx', 'utf8');
    expect(src.match(/\.map\(stripProjectPrices\)/g)).toHaveLength(2);
    expect(src.match(/stripSitePrices\(rawSite\)/g)).toHaveLength(2);
    expect(src).not.toMatch(/=\s*await getProjectsFromDb\(\);/);
    expect(src).not.toMatch(/const siteData = await getSiteBySlugFromDb/);
  });
  it('list route filters projects and sites before schema / slim / client', () => {
    const src = readFileSync('app/[locale]/projects/page.tsx', 'utf8');
    expect(src).toContain('rawProjects.map(stripProjectPrices)');
    expect(src).toContain('rawSites.map(stripSitePrices)');
  });
  it('only the two /projects/ routes import the filter — service pages, guides, blog, home do not', () => {
    const users = execSync('git grep -l --untracked "strip-prices" -- app components lib', { encoding: 'utf8' }).trim().split('\n').sort();
    expect(users).toEqual(['app/[locale]/projects/[slug]/page.tsx', 'app/[locale]/projects/page.tsx']);
  });
});
