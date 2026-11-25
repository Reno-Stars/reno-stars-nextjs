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

  it('ClientMessages applies the strip before the provider', () => {
    const s = readFileSync('components/ClientMessages.tsx', 'utf8');
    expect(s).toContain('messages={stripClientPrices(pickMessages(');
  });
});
