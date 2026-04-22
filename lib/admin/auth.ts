import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD environment variable is required');
  return pw;
}

/** Derive a separate HMAC signing key so the raw password is never used directly as a key */
function getSigningKey(): string {
  return crypto
    .createHash('sha256')
    .update(getAdminPassword() + ':reno-stars-session-signing-key')
    .digest('hex');
}

/** Timing-safe compare against ADMIN_PASSWORD using hashed values */
export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  // Hash both values to ensure constant-time comparison regardless of length
  // This eliminates timing attacks that could reveal password length
  const passwordHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(passwordHash, expectedHash);
}

/** Create HMAC-signed session token: `timestamp.hmac` */
function signToken(timestamp: number): string {
  const hmac = crypto
    .createHmac('sha256', getSigningKey())
    .update(String(timestamp))
    .digest('hex');
  return `${timestamp}.${hmac}`;
}

/** Verify HMAC signature + expiry. Returns true if valid. */
export function verifyToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) return false;

  // Check expiry — also reject future timestamps (they would pass the age check)
  const now = Math.floor(Date.now() / 1000);
  if (timestamp > now || now - timestamp > SESSION_MAX_AGE) return false;

  // Verify HMAC
  const expected = signToken(timestamp);
  if (token.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/** Create session cookie scoped to /admin */
export async function createSession(): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const token = signToken(timestamp);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

/** Delete session cookie */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: COOKIE_NAME, path: '/' });
}

/** Validate current session. Returns true if authenticated. */
export async function validateSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
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
