/**
 * Set (or rotate) the /admin password.
 *
 *   pnpm admin:password                 # prompts, no echo, never hits the shell history
 *   ADMIN_NEW_PASSWORD=… pnpm admin:password --from-env
 *
 * Writes only the scrypt hash. The plaintext is never stored, logged, or
 * echoed. Rotating invalidates every outstanding session, because the session
 * HMAC key is derived from the stored hash.
 */
import 'dotenv/config';
import readline from 'readline';
import { Writable } from 'stream';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { hashPassword } from '../lib/admin/password-hash';

function promptHidden(question: string): Promise<string> {
  let muted = false;
  const mutableStdout = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const fromEnv = process.argv.includes('--from-env');
  let password: string;

  if (fromEnv) {
    password = process.env.ADMIN_NEW_PASSWORD ?? '';
    if (!password) {
      console.error('--from-env given but ADMIN_NEW_PASSWORD is empty.');
      process.exit(1);
    }
  } else {
    password = await promptHidden('New /admin password: ');
    const again = await promptHidden('Confirm: ');
    if (password !== again) {
      console.error('Passwords did not match. Nothing was changed.');
      process.exit(1);
    }
  }

  if (password.length < 8) {
    console.error('Refusing a password shorter than 8 characters.');
    process.exit(1);
  }

  const hash = await hashPassword(password);

  await db.execute(sql`
    INSERT INTO admin_credentials (id, password_hash, updated_at)
    VALUES (1, ${hash}, NOW())
    ON CONFLICT (id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          updated_at    = NOW()
  `);

  // Read it back and verify the round trip rather than trusting the INSERT —
  // "the statement ran" and "the credential works" are different claims.
  const { verifyPasswordHash } = await import('../lib/admin/password-hash');
  const rows = await db.execute(sql`SELECT password_hash FROM admin_credentials WHERE id = 1`);
  const stored = (rows as unknown as { rows?: Array<{ password_hash: string }> }).rows?.[0]
    ?? (rows as unknown as Array<{ password_hash: string }>)[0];
  if (!stored?.password_hash) {
    console.error('Wrote the row but could not read it back. Check the database.');
    process.exit(1);
  }
  const ok = await verifyPasswordHash(password, stored.password_hash);
  if (!ok) {
    console.error('Stored hash does not verify against the password just set. Aborting.');
    process.exit(1);
  }

  console.log('Admin password updated and verified. All existing sessions are now invalid.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
