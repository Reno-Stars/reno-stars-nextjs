import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminCredentials } from '@/lib/db/schema';
import { verifyPasswordHash } from './password-hash';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

/**
 * THE CREDENTIAL LIVES IN THE DATABASE, NOT THE ENVIRONMENT.
 *
 * This file used to read `process.env.ADMIN_PASSWORD` and throw when it was
 * unset. When the site moved onto the k3s fleet on 2026-08-15 that variable
 * did not come with it, and /admin could not be signed into for ten days —
 * the throw surfaced as an error card under the login title. Restoring it was
 * not ours to do: the value arrives through an ExternalSecret in the
 * platform's operator-config, and the client deploy identity is denied
 * `secrets` deliberately. DATABASE_URL was already delivered, so the
 * credential now lives somewhere we can actually reach and rotate.
 *
 * The env var survives as a LOCAL-DEV fallback only, consulted when the table
 * has no row. In production the row is the source of truth.
 */

/** Cached so /admin page views don't each cost a DB round trip. */
let cachedHash: { value: string; readAt: number } | null = null;
const HASH_TTL_MS = 60_000;

/** Test seam: drop the cache so a rotation is observed immediately. */
export function clearAdminCredentialCache(): void {
  cachedHash = null;
}

async function loadPasswordHash(): Promise<string | null> {
  const now = Date.now();
  if (cachedHash && now - cachedHash.readAt < HASH_TTL_MS) return cachedHash.value;

  try {
    const rows = await db
      .select({ passwordHash: adminCredentials.passwordHash })
      .from(adminCredentials)
      .where(eq(adminCredentials.id, 1))
      .limit(1);
    const hash = rows[0]?.passwordHash;
    if (hash) {
      cachedHash = { value: hash, readAt: now };
      return hash;
    }
  } catch (err) {
    // A DB blip must not be indistinguishable from a wrong password, but it
    // also must not take the panel down with a 500 the way the env-var throw
    // did. Log it and fall through to the dev fallback / a clean `false`.
    console.error('[admin/auth] could not read admin_credentials:', err);
  }
  return null;
}

/**
 * Local-dev fallback. Returns the encoded hash equivalent of a plaintext env
 * var, or null. Never used when the table has a row.
 */
function devPlaintextFallback(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

/**
 * Timing-safe verify. Async because the credential is a DB read plus a
 * memory-hard KDF.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await loadPasswordHash();
  if (hash) return verifyPasswordHash(password, hash);

  const plaintext = devPlaintextFallback();
  if (!plaintext) {
    console.error(
      '[admin/auth] no admin_credentials row and no ADMIN_PASSWORD fallback — ' +
        'seed one with `pnpm admin:password`',
    );
    return false;
  }
  // Hash both sides so the compare is constant-time regardless of length.
  const a = crypto.createHash('sha256').update(password).digest();
  const b = crypto.createHash('sha256').update(plaintext).digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * HMAC signing key derived from the stored credential, so the raw secret is
 * never used directly as a key AND rotating the password invalidates every
 * outstanding session — which is the behaviour you want from a rotation.
 */
async function getSigningKey(): Promise<string | null> {
  const material = (await loadPasswordHash()) ?? devPlaintextFallback();
  if (!material) return null;
  return crypto
    .createHash('sha256')
    .update(material + ':reno-stars-session-signing-key')
    .digest('hex');
}

/** Create HMAC-signed session token: `timestamp.hmac` */
async function signToken(timestamp: number): Promise<string | null> {
  const key = await getSigningKey();
  if (!key) return null;
  const hmac = crypto.createHmac('sha256', key).update(String(timestamp)).digest('hex');
  return `${timestamp}.${hmac}`;
}

/** Verify HMAC signature + expiry. Returns true if valid. */
export async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) return false;

  // Check expiry — also reject future timestamps (they would pass the age check)
  const now = Math.floor(Date.now() / 1000);
  if (timestamp > now || now - timestamp > SESSION_MAX_AGE) return false;

  // Verify HMAC
  const expected = await signToken(timestamp);
  if (!expected) return false;
  if (token.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/** Create session cookie scoped to /admin */
export async function createSession(): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const token = await signToken(timestamp);
  if (!token) throw new Error('Cannot create an admin session: no credential is configured.');
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_MAX_AGE,
  });
}

/** Delete session cookie */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: COOKIE_NAME, path: '/admin' });
}

/** Validate current session. Returns true if authenticated. */
export async function validateSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return await verifyToken(token);
}

/** Require authentication. Redirects to login if invalid. */
export async function requireAuth(): Promise<void> {
  const valid = await validateSession();
  if (!valid) {
    redirect('/admin/login');
  }
}

/**
 * Validate that a string is a valid UUID format.
 * Intentionally permissive: accepts any valid UUID format (v1-v5),
 * not just v4, since database-generated UUIDs may vary by version.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}
