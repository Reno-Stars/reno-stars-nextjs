import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Mock next/headers cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock next/navigation redirect
const mockRedirect = vi.fn(() => {
  throw new Error('NEXT_REDIRECT');
});
vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// This suite covers the LOCAL-DEV path: no admin_credentials row, so the
// module falls back to process.env.ADMIN_PASSWORD. The DB-backed path — which
// is what production uses — is covered in auth-db-credential.test.ts.
const mockRows: Array<{ passwordHash: string }> = [];
vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(mockRows),
        }),
      }),
    }),
  },
}));

describe('lib/admin/auth', () => {
  const TEST_PASSWORD = 'test-admin-password-123';

  beforeEach(() => {
    vi.resetModules();
    process.env.ADMIN_PASSWORD = TEST_PASSWORD;
    mockCookieStore.get.mockReset();
    mockCookieStore.set.mockReset();
    mockCookieStore.delete.mockReset();
    mockRedirect.mockReset().mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  /** Generate a valid HMAC-signed session token for testing */
  function generateValidToken(timestampOverride?: number): string {
    const timestamp = timestampOverride ?? Math.floor(Date.now() / 1000);
    const signingKey = crypto
      .createHash('sha256')
      .update(TEST_PASSWORD + ':reno-stars-session-signing-key')
      .digest('hex');
    const hmac = crypto
      .createHmac('sha256', signingKey)
      .update(String(timestamp))
      .digest('hex');
    return `${timestamp}.${hmac}`;
  }

  async function loadAuth() {
    return import('@/lib/admin/auth');
  }

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const { verifyPassword } = await loadAuth();
      expect(await verifyPassword(TEST_PASSWORD)).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const { verifyPassword } = await loadAuth();
      expect(await verifyPassword('wrong-password')).toBe(false);
    });

    it('should return false for empty string', async () => {
      const { verifyPassword } = await loadAuth();
      expect(await verifyPassword('')).toBe(false);
    });

    it('should return false for similar but not identical password', async () => {
      const { verifyPassword } = await loadAuth();
      expect(await verifyPassword(TEST_PASSWORD + ' ')).toBe(false);
    });

    // DELIBERATE BEHAVIOUR CHANGE. This used to assert a THROW, and that throw
    // is what took /admin down for ten days after the k3s migration: the login
    // server action called it, nothing caught it, and the error boundary
    // rendered a generic "Server Components render" card. A missing credential
    // is now a refused login, which is what a login form is supposed to do
    // with a credential it cannot verify.
    it('refuses the login — never throws — when no credential is configured anywhere', async () => {
      delete process.env.ADMIN_PASSWORD;
      const { verifyPassword } = await loadAuth();
      await expect(verifyPassword('anything')).resolves.toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid fresh token', async () => {
      const { verifyToken } = await loadAuth();
      expect(await verifyToken(generateValidToken())).toBe(true);
    });

    it('should reject expired tokens (>24h old)', async () => {
      const { verifyToken } = await loadAuth();
      const expiredTimestamp = Math.floor(Date.now() / 1000) - (25 * 60 * 60);
      expect(await verifyToken(generateValidToken(expiredTimestamp))).toBe(false);
    });

    it('should reject tokens with invalid HMAC', async () => {
      const { verifyToken } = await loadAuth();
      const timestamp = Math.floor(Date.now() / 1000);
      const token = `${timestamp}.invalid-hmac-signature`;
      expect(await verifyToken(token)).toBe(false);
    });

    it('should reject tokens without a dot separator', async () => {
      const { verifyToken } = await loadAuth();
      expect(await verifyToken('nodothere')).toBe(false);
    });

    it('should reject tokens with multiple dots', async () => {
      const { verifyToken } = await loadAuth();
      expect(await verifyToken('a.b.c')).toBe(false);
    });

    it('should reject tokens with non-numeric timestamp', async () => {
      const { verifyToken } = await loadAuth();
      expect(await verifyToken('notanumber.somehash')).toBe(false);
    });

    it('should reject empty string', async () => {
      const { verifyToken } = await loadAuth();
      expect(await verifyToken('')).toBe(false);
    });

    it('should reject tokens with wrong length HMAC (length mismatch)', async () => {
      const { verifyToken } = await loadAuth();
      const timestamp = Math.floor(Date.now() / 1000);
      // Short HMAC — will fail length check before timingSafeEqual
      expect(await verifyToken(`${timestamp}.abc`)).toBe(false);
    });
  });

  describe('createSession', () => {
    it('should set a session cookie with correct options', async () => {
      const { createSession } = await loadAuth();
      await createSession();

      expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
      const [name, token, options] = mockCookieStore.set.mock.calls[0];
      expect(name).toBe('admin_session');
      expect(token).toMatch(/^\d+\.[a-f0-9]+$/);
      expect(options).toEqual(
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/admin',
          maxAge: 86400,
        })
      );
    });
  });

  describe('destroySession', () => {
    it('should delete the session cookie', async () => {
      const { destroySession } = await loadAuth();
      await destroySession();

      expect(mockCookieStore.delete).toHaveBeenCalledWith({
        name: 'admin_session',
        path: '/admin',
      });
    });
  });

  describe('validateSession', () => {
    it('should return false when no cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const { validateSession } = await loadAuth();
      expect(await validateSession()).toBe(false);
    });

    it('should return false for invalid token', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'invalid.token' });
      const { validateSession } = await loadAuth();
      expect(await validateSession()).toBe(false);
    });

    it('should return true for valid token', async () => {
      mockCookieStore.get.mockReturnValue({ value: generateValidToken() });
      const { validateSession } = await loadAuth();
      expect(await validateSession()).toBe(true);
    });
  });

  describe('requireAuth', () => {
    it('should redirect to login when session is invalid', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const { requireAuth } = await loadAuth();

      await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login');
    });

    it('should not redirect when session is valid', async () => {
      mockCookieStore.get.mockReturnValue({ value: generateValidToken() });
      const { requireAuth } = await loadAuth();

      await expect(requireAuth()).resolves.toBeUndefined();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('isValidUUID', () => {
    it('should accept valid v4 UUIDs', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should accept uppercase UUIDs', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('should accept mixed case UUIDs', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
    });

    it('should reject strings that are too short', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550e8400-e29b-41d4')).toBe(false);
    });

    it('should reject strings without dashes', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
    });

    it('should reject empty string', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('')).toBe(false);
    });

    it('should reject non-hex characters', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550g8400-e29b-41d4-a716-446655440000')).toBe(false);
    });

    it('should reject strings with wrong segment lengths', async () => {
      const { isValidUUID } = await loadAuth();
      expect(isValidUUID('550e84-00e29b-41d4-a716-446655440000')).toBe(false);
    });
  });
});
