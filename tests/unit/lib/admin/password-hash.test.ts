import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPasswordHash } from '@/lib/admin/password-hash';

describe('lib/admin/password-hash', () => {
  it('verifies a password against its own hash', async () => {
    const h = await hashPassword('correct horse battery staple');
    await expect(verifyPasswordHash('correct horse battery staple', h)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const h = await hashPassword('one');
    await expect(verifyPasswordHash('two', h)).resolves.toBe(false);
  });

  it('salts — the same password hashes differently every time', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toBe(b);
    await expect(verifyPasswordHash('same', a)).resolves.toBe(true);
    await expect(verifyPasswordHash('same', b)).resolves.toBe(true);
  });

  it('never stores the plaintext', async () => {
    const h = await hashPassword('sup3r-s3cret-value');
    expect(h).not.toContain('sup3r-s3cret-value');
  });

  it('encodes its parameters so an old hash stays verifiable', async () => {
    const h = await hashPassword('x');
    expect(h.split('$').slice(0, 4)).toEqual(['scrypt', String(1 << 17), '8', '1']);
  });

  // Every one of these must be `false`, never a throw — a corrupt row has to
  // read as "wrong password", not as a 500 on the login page.
  it.each([
    ['empty', ''],
    ['not encoded at all', 'hunter2'],
    ['unknown scheme', 'bcrypt$1$2$3$4$5'],
    ['too few fields', 'scrypt$131072$8$1$onlysalt'],
    ['non-numeric cost', 'scrypt$abc$8$1$c2FsdA==$aGFzaA=='],
    ['absurd cost (DoS guard)', 'scrypt$999999999$8$1$c2FsdA==$aGFzaA=='],
    ['empty salt and hash', 'scrypt$131072$8$1$$'],
  ])('returns false for a malformed hash: %s', async (_label, encoded) => {
    await expect(verifyPasswordHash('anything', encoded)).resolves.toBe(false);
  });
});
