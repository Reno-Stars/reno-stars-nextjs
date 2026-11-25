import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { stripClientPrices } from '@/lib/seo/client-price-messages';
import { hasPriceCopy } from '@/lib/seo/strip-price-copy';

/**
 * Task 136: NearMePage is a client component, so its `nearMe` messages are
 * serialized into the RSC payload. ClientMessages strips them on the SERVER.
 */
const LOCALES = readdirSync('messages').filter((d) => existsSync(`messages/${d}/nearMe.json`));

function leaves(o: unknown, path = ''): Array<[string, string]> {
  if (typeof o === 'string') return [[path, o]];
  if (o && typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  return [];
}

describe('nearMe client messages are price-free (all locales)', () => {
  it('covers all 14 site locales', () => expect(LOCALES).toHaveLength(14));

  it.each(LOCALES)('%s: no renovation price outside trust.*, trust.* byte-identical, no key lost', (loc) => {
    const raw = JSON.parse(readFileSync(`messages/${loc}/nearMe.json`, 'utf8')) as Record<string, unknown>;
    const nearMe = (raw.nearMe ?? raw) as Record<string, unknown>;
    const out = stripClientPrices({ nearMe, cta: { stickyCall: 'Call' } });
    const before = leaves(nearMe);
    const after = new Map(leaves(out.nearMe));
    expect([...after.keys()].sort()).toEqual(before.map(([k]) => k).sort());
    for (const [k, v] of after) if (!k.startsWith('trust.')) expect(hasPriceCopy(v), `${loc} ${k}: ${v}`).toBe(false);
    for (const [k, v] of before) if (k.startsWith('trust.')) expect(after.get(k)).toBe(v);
    expect(out.cta).toEqual({ stickyCall: 'Call' });           // other namespaces untouched
  });

  it('the catalog really had prices to remove (the test is not vacuous)', () => {
    const raw = JSON.parse(readFileSync('messages/en/nearMe.json', 'utf8')) as Record<string, unknown>;
    const priced = leaves(raw.nearMe ?? raw).filter(([k, v]) => !k.startsWith('trust.') && hasPriceCopy(v));
    expect(priced.length).toBeGreaterThan(0);
  });

  it('ClientMessages strips every namespace before the provider unless keepPrices', () => {
    const s = readFileSync('components/ClientMessages.tsx', 'utf8');
    expect(s).toContain('return keepPrices ? picked : stripClientPrices(picked);');
    expect(s).toContain('messages={clientMessages(pickMessages(');
  });
});

describe('NearMePage gets area LINKS only, never full service-area rows (task 136)', () => {
  it('nearMeAreaLinks keeps slug + name and drops everything else', async () => {
    const { nearMeAreaLinks } = await import('@/lib/seo/client-price-messages');
    const row = {
      slug: 'vancouver', name: { en: 'Vancouver', zh: '温哥华' },
      content: { en: 'Kitchen renovations from $14,000 to $72,000.' }, description: { en: '$25K–$80K' },
    };
    const out = nearMeAreaLinks([row]);
    expect(out).toEqual([{ slug: 'vancouver', name: { en: 'Vancouver', zh: '温哥华' } }]);
    expect(JSON.stringify(out)).not.toMatch(/\$/);
  });

  it.each(['kitchen', 'bathroom', 'basement', 'whole-house', ''])('%s-near-me route passes nearMeAreaLinks(areas)', (v) => {
    const s = readFileSync(`app/[locale]/${v ? `${v}-` : ''}renovation-near-me/page.tsx`, 'utf8');
    expect(s).toContain('areas={nearMeAreaLinks(areas)}');
    expect(s).not.toContain('areas={areas}');
  });

  it('NearMePage props are typed as links, not ServiceArea rows', () => {
    const s = readFileSync('components/pages/NearMePage.tsx', 'utf8');
    expect(s).toContain('areas: NearMeAreaLink[];');
    expect(s).not.toMatch(/areas: ServiceArea\[\]/);
  });
});

// Task 136 addendum 2: EVERY namespace ClientMessages serializes is filtered (financing, services, …).
describe('generic client-message filter (all namespaces, all locales)', () => {
  const ALL = LOCALES.map((loc) => {
    const merged: Record<string, unknown> = {};
    for (const f of readdirSync(`messages/${loc}`).filter((x) => x.endsWith('.json'))) {
      Object.assign(merged, JSON.parse(readFileSync(`messages/${loc}/${f}`, 'utf8')) as Record<string, unknown>);
    }
    return [loc, merged] as const;
  });
  // Namespaces only KEEP routes serialize (they pass keepPrices) are out of scope here.
  const KEEP_ONLY = new Set(['guides', 'blog', 'careers', 'careersPage']);

  it.each(ALL)('%s: no renovation price is serialized outside trust.*; no key lost', (loc, merged) => {
    const scoped = Object.fromEntries(Object.entries(merged).filter(([ns]) => !KEEP_ONLY.has(ns)));
    const out = stripClientPrices(scoped);
    const before = leaves(scoped);
    const after = new Map(leaves(out));
    expect(after.size).toBe(before.length);
    for (const [k, v] of after) if (!/(^|\.)trust\./.test(k)) expect(hasPriceCopy(v), `${loc} ${k}: ${v}`).toBe(false);
  });

  it('en financing: the "$15,000 – $72,000" kitchen range is gone, the loan terms stay', () => {
    const fin = JSON.parse(readFileSync('messages/en/financing.json', 'utf8')) as Record<string, unknown>;
    const raw = JSON.stringify(fin);
    const out = JSON.stringify(stripClientPrices(fin));
    expect(raw).toMatch(/\$15,000/);
    expect(out).not.toMatch(/\$15,000/);
    expect(out).toMatch(/Prime \+ 0\.5% to 2%/);
  });

  it('subsidy amounts survive the client filter (faq heat-pump a1, HAFI a2)', () => {
    const faq = JSON.parse(readFileSync('messages/en/faq.json', 'utf8')) as { faq: Record<string, Record<string, string>> };
    const out = stripClientPrices(faq) as typeof faq;
    expect(out.faq['heat-pump-hvac'].a1).toBe(faq.faq['heat-pump-hvac'].a1);
    expect(out.faq['accessible-bathroom'].a2).toBe(faq.faq['accessible-bathroom'].a2);
  });
});

describe('price-keeping routes are exactly blog, guides and test A', () => {
  const routes = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? routes(`${dir}/${e.name}`) : e.name === 'page.tsx' ? [`${dir}/${e.name}`] : []);
  const NS = /<ClientMessages ns=\{\[([^\]]*)\]\}/g;
  const pages = routes('app/[locale]').flatMap((p) =>
    [...readFileSync(p, 'utf8').matchAll(NS)].map((m) => [p, m[1].split(',').map((x) => x.trim().replace(/^'|'$/g, ''))] as const));
  const keepsByNs = (ns: readonly string[]) => ns.some((n) => n === 'blog' || n === 'guides' || n.startsWith('guides.'));

  it('ClientMessages keeps prices only via keepPrices or a blog/guides namespace', () => {
    const s = readFileSync('components/ClientMessages.tsx', 'utf8');
    expect(s).toContain("return ns.some((n) => n === 'blog' || n === 'guides' || n.startsWith('guides.'));");
    expect(s).toContain('keepPrices || servesKeepContent(ns)');
  });
  it('blog / guides routes (and only they) serialize a blog/guides namespace', () => {
    for (const [p, ns] of pages) expect(keepsByNs(ns), p).toBe(/\/(blog|guides)\//.test(p));
    expect(pages.filter(([p]) => p.includes('/guides/')).length).toBe(10);
  });
  it('only the service×city route passes keepPrices, and only for test A', () => {
    const users = routes('app/[locale]').filter((p) => readFileSync(p, 'utf8').includes('keepPrices'));
    expect(users).toEqual(['app/[locale]/services/[service-slug]/[city]/page.tsx']);
    const s = readFileSync(users[0], 'utf8');
    expect(s).toMatch(/<ClientMessages ns=\{\[[^\]]*\]\} keepPrices=\{!stripPrices\}>/);
    expect(s).toContain('const stripPrices = !isTestA(locale, serviceSlug, city);');
  });
});
