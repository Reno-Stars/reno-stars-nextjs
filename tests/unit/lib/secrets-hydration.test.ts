import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Regression cover for a monitor that lied.
 *
 * /api/health/config resolves through getSecret (env -> Infisical -> DB), so it
 * reported `cachePurge: ok` because CLOUDFLARE_API_TOKEN was in the bridge.
 * lib/cloudflare-purge.ts, meanwhile, reads `process.env.CLOUDFLARE_API_TOKEN`
 * at MODULE LOAD and got undefined — so purging silently no-opped while the
 * health check said the capability was fine.
 *
 * A check that measures something other than what the runtime does is worse
 * than no check: it actively certifies the broken state as healthy. These tests
 * pin the property that makes them agree — after hydration, the synchronous
 * `process.env` read and the async `getSecret` read return the same value.
 */

const VAULT_HOST = 'https://vault.test';

function mockVault(secrets: Record<string, string>) {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    if (u.includes('/auth/universal-auth/login')) {
      return new Response(JSON.stringify({ accessToken: 'tok' }), { status: 200 });
    }
    if (u.includes('/api/v3/secrets/raw')) {
      return new Response(
        JSON.stringify({
          secrets: Object.entries(secrets).map(([secretKey, secretValue]) => ({ secretKey, secretValue })),
        }),
        { status: 200 },
      );
    }
    throw new Error(`unexpected fetch: ${u}`);
  });
}

let secrets: typeof import('@/lib/secrets');

beforeEach(async () => {
  vi.resetModules();
  process.env.INFISICAL_CLIENT_ID = 'id';
  process.env.INFISICAL_CLIENT_SECRET = 'secret';
  process.env.INFISICAL_HOST = VAULT_HOST;
  delete process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.OPERATOR_SET;
  secrets = await import('@/lib/secrets');
  secrets.resetSecretsCacheForTests();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  secrets.resetSecretsCacheForTests();
  delete process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.OPERATOR_SET;
  vi.restoreAllMocks();
});

describe('boot-time secret hydration', () => {
  it('makes a SYNCHRONOUS process.env read see a vault-only secret', async () => {
    vi.stubGlobal('fetch', mockVault({ CLOUDFLARE_API_TOKEN: 'cf-live' }));

    // The exact pre-fix production state: the async check can see it...
    expect(await secrets.getSecret('CLOUDFLARE_API_TOKEN')).toBe('cf-live');
    // ...while the sync reader that actually does the work cannot.
    expect(process.env.CLOUDFLARE_API_TOKEN).toBeUndefined();

    await secrets.hydrateEnvFromSecrets();

    // After hydration the two agree, which is the property the health
    // endpoint's honesty depends on.
    expect(process.env.CLOUDFLARE_API_TOKEN).toBe('cf-live');
    expect(await secrets.getSecret('CLOUDFLARE_API_TOKEN')).toBe('cf-live');
  });

  it('never overwrites a variable an operator explicitly set', async () => {
    process.env.OPERATOR_SET = 'from-operator';
    vi.stubGlobal('fetch', mockVault({ OPERATOR_SET: 'from-vault' }));

    const { hydrated } = await secrets.hydrateEnvFromSecrets();

    expect(process.env.OPERATOR_SET).toBe('from-operator');
    expect(hydrated).not.toContain('OPERATOR_SET');
  });

  it('does not let a hydrated value freeze out a later vault change', async () => {
    // The reason hydration is a cache and not a source. If process.env won tier
    // 1 unconditionally, rotating a key in Infisical would never reach a
    // running pod, and the only fix would be a restart nobody knows to do.
    vi.stubGlobal('fetch', mockVault({ CLOUDFLARE_API_TOKEN: 'old' }));
    await secrets.hydrateEnvFromSecrets();
    expect(process.env.CLOUDFLARE_API_TOKEN).toBe('old');

    vi.stubGlobal('fetch', mockVault({ CLOUDFLARE_API_TOKEN: 'rotated' }));
    secrets.resetSecretsCacheForTests();
    process.env.INFISICAL_CLIENT_ID = 'id';
    process.env.INFISICAL_CLIENT_SECRET = 'secret';
    process.env.INFISICAL_HOST = VAULT_HOST;
    await secrets.hydrateEnvFromSecrets();

    expect(await secrets.getSecret('CLOUDFLARE_API_TOKEN')).toBe('rotated');
  });

  it('logs the key NAMES it hydrated and never a value', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('fetch', mockVault({ CLOUDFLARE_API_TOKEN: 'super-secret-value' }));

    await secrets.hydrateEnvFromSecrets();

    const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.includes('secrets.hydrated'));
    expect(line).toBeDefined();
    expect(line).toContain('CLOUDFLARE_API_TOKEN');
    expect(line).not.toContain('super-secret-value');
  });

  it('does not throw when the vault is unreachable — features degrade, boot does not fail', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));

    await expect(secrets.hydrateEnvFromSecrets()).resolves.toEqual({
      hydrated: [],
      reachedASource: false,
    });
  });
});

describe('boot-race retry', () => {
  /**
   * The first production deploy of hydration was INERT. Every pod logged
   *   {"event":"secrets.hydrated","count":0,"sources":{"vault":0,"bridge":0}}
   * with `connect ECONNREFUSED 10.43.143.182:5432` beside it: `register()` runs
   * early enough to lose the pod's boot-time connection race, so the one and
   * only hydration attempt reached nothing. The rollout was green, the health
   * endpoint was 200, and the fix did nothing at all.
   */
  it('recovers when the FIRST attempt loses the pod boot race', async () => {
    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const u = String(url);
        if (u.includes('/auth/universal-auth/login')) {
          // First boot attempt: connection refused, exactly as in production.
          if (call++ === 0) throw new Error('connect ECONNREFUSED 10.43.143.182:5432');
          return new Response(JSON.stringify({ accessToken: 'tok' }), { status: 200 });
        }
        return new Response(
          JSON.stringify({ secrets: [{ secretKey: 'CLOUDFLARE_API_TOKEN', secretValue: 'cf-live' }] }),
          { status: 200 },
        );
      }),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const noSleep = async () => {};
    const result = await secrets.hydrateEnvWithRetry(6, 0, noSleep);

    expect(result.reachedASource).toBe(true);
    expect(process.env.CLOUDFLARE_API_TOKEN).toBe('cf-live');
  });

  it('does NOT keep retrying when a source answered and there was simply nothing to add', async () => {
    process.env.CLOUDFLARE_API_TOKEN = 'already-in-env';
    const fetchMock = mockVault({ CLOUDFLARE_API_TOKEN: 'from-vault' });
    vi.stubGlobal('fetch', fetchMock);

    const result = await secrets.hydrateEnvWithRetry(6, 0, async () => {});

    // Zero hydrated, but the vault DID answer — that is a finished job.
    expect(result.hydrated).toEqual([]);
    expect(result.reachedASource).toBe(true);
    // login + read, once. A retry loop here would spin on every healthy pod.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after the configured attempts and says so, without throwing', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED'); }));

    const result = await secrets.hydrateEnvWithRetry(3, 0, async () => {});

    expect(result.reachedASource).toBe(false);
    const line = err.mock.calls.map((c) => String(c[0])).find((l) => l.includes('no_source'));
    expect(line).toBeDefined();
  });
});
