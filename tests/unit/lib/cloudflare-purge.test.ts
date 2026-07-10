import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

// The module reads env at import time, so set env then dynamic-import per case.
const ORIG = { ...process.env };
afterEach(() => {
  process.env = { ...ORIG };
  vi.restoreAllMocks();
  vi.resetModules();
});
beforeEach(() => vi.resetModules());

describe('cloudflare-purge', () => {
  it('is a NO-OP when the token/zone env is unset (never calls fetch)', async () => {
    delete process.env.CLOUDFLARE_ZONE_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { purgeCloudflareUrls, purgeCloudflareEverything } = await import('@/lib/cloudflare-purge');
    await purgeCloudflareUrls(['https://www.reno-stars.com/en/']);
    await purgeCloudflareEverything();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('purges in batches of 30 URLs when enabled', async () => {
    process.env.CLOUDFLARE_ZONE_ID = 'zone';
    process.env.CLOUDFLARE_API_TOKEN = 'tok';
    const bodies: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      bodies.push(init.body as string);
      return { ok: true, text: async () => '' } as unknown as Response;
    }));
    const { purgeCloudflareUrls } = await import('@/lib/cloudflare-purge');
    const urls = Array.from({ length: 65 }, (_, i) => `https://www.reno-stars.com/p${i}/`);
    await purgeCloudflareUrls(urls);
    expect(bodies).toHaveLength(3); // 30 + 30 + 5
    expect(JSON.parse(bodies[0]).files).toHaveLength(30);
    expect(JSON.parse(bodies[2]).files).toHaveLength(5);
  });

  it('purgeEverything sends purge_everything:true', async () => {
    process.env.CLOUDFLARE_ZONE_ID = 'zone';
    process.env.CLOUDFLARE_API_TOKEN = 'tok';
    let sentBody = '';
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      sentBody = init.body as string;
      return { ok: true, text: async () => '' } as unknown as Response;
    }));
    const { purgeCloudflareEverything } = await import('@/lib/cloudflare-purge');
    await purgeCloudflareEverything();
    expect(JSON.parse(sentBody)).toEqual({ purge_everything: true });
  });

  it('empty URL list makes no call', async () => {
    process.env.CLOUDFLARE_ZONE_ID = 'zone';
    process.env.CLOUDFLARE_API_TOKEN = 'tok';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { purgeCloudflareUrls } = await import('@/lib/cloudflare-purge');
    await purgeCloudflareUrls([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
