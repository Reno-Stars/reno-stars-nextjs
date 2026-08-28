import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The PRODUCTION path: the /admin credential comes from the
 * `admin_credentials` table, not from process.env.
 *
 * Regression context — /admin was impossible to sign into from 2026-08-15 to
 * 2026-08-25 because lib/admin/auth.ts threw `ADMIN_PASSWORD environment
 * variable is required` and the site's migration onto k3s had not carried that
 * variable across. Restoring the variable was not possible from this repo: it
 * is delivered by an ExternalSecret in the platform's operator-config and the
 * client deploy identity is denied `secrets` by design. So the credential moved
 * to the database, which the app already has a connection to.
 *
 * These tests assert the properties that keep that class of outage from
 * recurring: a missing or corrupt credential REFUSES a login rather than
 * throwing, and the env var is only ever a fallback.
 */

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
}));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

let rows: Array<{ passwordHash: string }> = [];
let selectThrows = false;

vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => (selectThrows ? Promise.reject(new Error('connection refused')) : Promise.resolve(rows)),
        }),
      }),
    }),
  },
}));

const DB_PASSWORD = 'the-password-in-the-database';

async function freshAuth() {
  vi.resetModules();
  return import('@/lib/admin/auth');
}

describe('admin credential sourced from the database', () => {
  beforeEach(async () => {
    rows = [];
    selectThrows = false;
    delete process.env.ADMIN_PASSWORD;
    vi.restoreAllMocks();
    const { hashPassword } = await import('@/lib/admin/password-hash');
    rows = [{ passwordHash: await hashPassword(DB_PASSWORD) }];
  });

  it('accepts the password whose hash is stored', async () => {
    const { verifyPassword } = await freshAuth();
    await expect(verifyPassword(DB_PASSWORD)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const { verifyPassword } = await freshAuth();
    await expect(verifyPassword('not-it')).resolves.toBe(false);
  });

  it('prefers the stored hash over an env var that disagrees', async () => {
    process.env.ADMIN_PASSWORD = 'stale-env-value';
    const { verifyPassword } = await freshAuth();
    await expect(verifyPassword(DB_PASSWORD)).resolves.toBe(true);
    await expect(verifyPassword('stale-env-value')).resolves.toBe(false);
  });

  it('issues a session that validates end to end', async () => {
    const { createSession, verifyToken } = await freshAuth();
    let stored = '';
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: stored }),
      set: (_n: string, v: string) => { stored = v; },
      delete: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await createSession();
    expect(stored).toMatch(/^\d+\.[a-f0-9]{64}$/);
    await expect(verifyToken(stored)).resolves.toBe(true);
  });

  it('a session signed under the OLD credential stops validating after rotation', async () => {
    const auth = await freshAuth();
    let stored = '';
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: stored }),
      set: (_n: string, v: string) => { stored = v; },
      delete: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await auth.createSession();
    await expect(auth.verifyToken(stored)).resolves.toBe(true);

    const { hashPassword } = await import('@/lib/admin/password-hash');
    rows = [{ passwordHash: await hashPassword('a-brand-new-password') }];
    auth.clearAdminCredentialCache();

    await expect(auth.verifyToken(stored)).resolves.toBe(false);
  });

  // The three shapes that used to be a 500.
  it('refuses, without throwing, when the table has no row and no env fallback', async () => {
    rows = [];
    const { verifyPassword, verifyToken } = await freshAuth();
    await expect(verifyPassword('anything')).resolves.toBe(false);
    await expect(verifyToken('123.abc')).resolves.toBe(false);
  });

  it('refuses, without throwing, when the stored hash is corrupt', async () => {
    rows = [{ passwordHash: 'not-a-valid-encoded-hash' }];
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { verifyPassword } = await freshAuth();
    await expect(verifyPassword(DB_PASSWORD)).resolves.toBe(false);
  });

  it('refuses, without throwing, when the database is unreachable', async () => {
    selectThrows = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { verifyPassword } = await freshAuth();
    await expect(verifyPassword(DB_PASSWORD)).resolves.toBe(false);
  });

  it('falls back to the env var only when the table has no row', async () => {
    rows = [];
    process.env.ADMIN_PASSWORD = 'local-dev-password';
    const { verifyPassword } = await freshAuth();
    await expect(verifyPassword('local-dev-password')).resolves.toBe(true);
    await expect(verifyPassword(DB_PASSWORD)).resolves.toBe(false);
  });
});
