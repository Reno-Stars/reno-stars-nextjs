import { describe, it, expect, vi, afterEach } from 'vitest';
import { gtxTranslate } from '@/lib/admin/gtx-translate';

afterEach(() => vi.restoreAllMocks());

describe('gtxTranslate brand glossary', () => {
  // Fetch echoes back whatever `q` it received (a real translator leaves the
  // word-joiner-delimited sentinel atomic). Proves mask→restore round-trips the
  // brand verbatim and that the sentinel is what's sent, not the raw brand.
  it('protects "Reno Stars Construction" and restores it verbatim', async () => {
    let sentQ = '';
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      sentQ = new URL(url).searchParams.get('q')!;
      return { ok: true, json: async () => [[[sentQ]]] } as unknown as Response;
    }));
    const out = await gtxTranslate('Welcome to Reno Stars Construction today', 'zh');
    // brand was masked before the network call (not sent as raw words)…
    expect(sentQ).not.toContain('Reno Stars');
    expect(sentQ).toContain('⁠RS');
    // …and restored verbatim in the output
    expect(out).toContain('Reno Stars Construction');
    expect(out).not.toContain('⁠RS');
  });
});
