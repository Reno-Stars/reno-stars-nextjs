import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * The DB bridge is TIER 3 and must stay last: it exists only because the
 * migration left 25 runtime vars undeliverable and the operator ask is pending.
 * If it ever outranks process.env or Infisical it stops self-retiring, and a
 * stale row would silently shadow a real credential.
 */

const rows: { key: string; value: string }[] = [];
const selectFrom = vi.fn(async () => rows);

vi.mock('@/lib/db', () => ({
  db: { select: () => ({ from: selectFrom }) },
}));
vi.mock('@/lib/db/schema', () => ({ appSecrets: { key: 'key', value: 'value' } }));
vi.mock('server-only', () => ({}));

const load = async () => {
  const mod = await import('@/lib/secrets');
  mod.resetSecretsCacheForTests();
  return mod;
};

beforeEach(() => {
  rows.length = 0;
  selectFrom.mockClear();
  delete process.env.INFISICAL_CLIENT_ID;
  delete process.env.INFISICAL_CLIENT_SECRET;
  delete process.env.TEST_SECRET;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('getSecret DB bridge', () => {
  it('falls back to the database when env and vault have nothing', async () => {
    rows.push({ key: 'TEST_SECRET', value: 'from-db' });
    const { getSecret } = await load();
    expect(await getSecret('TEST_SECRET')).toBe('from-db');
  });

  it('process.env WINS over the database — the bridge must self-retire', async () => {
    rows.push({ key: 'TEST_SECRET', value: 'from-db' });
    process.env.TEST_SECRET = 'from-env';
    const { getSecret } = await load();
    expect(await getSecret('TEST_SECRET')).toBe('from-env');
    // and the DB is never even consulted
    expect(selectFrom).not.toHaveBeenCalled();
  });

  it('returns undefined when no tier has the key', async () => {
    const { getSecret } = await load();
    expect(await getSecret('TEST_SECRET')).toBeUndefined();
  });

  it('caches, so a burst of lookups makes ONE query', async () => {
    rows.push({ key: 'TEST_SECRET', value: 'v' }, { key: 'OTHER', value: 'w' });
    const { getSecret } = await load();
    await Promise.all([getSecret('TEST_SECRET'), getSecret('OTHER'), getSecret('TEST_SECRET')]);
    expect(selectFrom).toHaveBeenCalledTimes(1);
  });

  it('a database failure degrades to undefined and never throws', async () => {
    selectFrom.mockRejectedValueOnce(new Error('db down'));
    const { getSecret } = await load();
    await expect(getSecret('TEST_SECRET')).resolves.toBeUndefined();
  });

  it('ignores empty stored values rather than returning an empty credential', async () => {
    rows.push({ key: 'TEST_SECRET', value: '' });
    const { getSecret } = await load();
    expect(await getSecret('TEST_SECRET')).toBeUndefined();
  });
});
