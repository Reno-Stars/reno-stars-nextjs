import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: crypto.ScryptOptions,
) => Promise<Buffer>;

/**
 * Password hashing for the /admin credential.
 *
 * scrypt from Node's own crypto — deliberately NOT bcrypt/argon2. Those are
 * native modules, and this image is built under a 100 MB per-layer registry
 * cap; a native build step is a real cost for a single-credential login.
 * scrypt is memory-hard, is in the standard library, and needs no build.
 *
 * Encoded form (all one column, so the parameters travel with the hash and an
 * old hash stays verifiable after the cost parameters are raised):
 *
 *     scrypt$<N>$<r>$<p>$<salt-base64>$<hash-base64>
 */

// OWASP's scrypt floor (N=2^17, r=8, p=1). maxmem must be raised explicitly:
// Node defaults to 32 MB and N=131072 needs ~128 MB, so the default would
// throw rather than run weakly.
const N = 1 << 17;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;
const MAXMEM = 256 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES);
  const hash = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/**
 * Constant-time verify against an encoded hash.
 *
 * Returns false — never throws — on a malformed or unknown-scheme stored
 * value. A corrupt row must read as "wrong password", not as a 500: the
 * env-var version of this file threw on a missing value and that is precisely
 * the failure that took /admin down for ten days.
 */
export async function verifyPasswordHash(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  // Bound the work an attacker-supplied row could ask for.
  if (n < 1024 || n > 1 << 20 || r < 1 || r > 32 || p < 1 || p > 16) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], 'base64');
    expected = Buffer.from(parts[5], 'base64');
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  let actual: Buffer;
  try {
    actual = await scrypt(password, salt, expected.length, { N: n, r, p, maxmem: MAXMEM });
  } catch {
    return false;
  }

  // Lengths match by construction (keylen = expected.length), so
  // timingSafeEqual cannot throw here.
  return crypto.timingSafeEqual(actual, expected);
}
