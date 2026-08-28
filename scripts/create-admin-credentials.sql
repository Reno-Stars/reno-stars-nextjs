-- admin_credentials — the /admin sign-in credential, as a scrypt hash.
--
-- Applied to production 2026-08-25 via
--   kubectl exec renostars-website-pg-0 -- psql -U postgres -d renostars
-- because this repo ships no drizzle migration directory; the established
-- practice here is schema.ts + a hand-applied migration (see commit 993a94b,
-- "Drizzle migration 0008, applied to prod via psql").
--
-- Additive and safe to apply while the old code is running: nothing reads this
-- table until the release that introduces lib/admin/password-hash.ts.
--
-- Apply to the `renostars` database ONLY. `renostars_prev_windowB` on the same
-- instance is a rollback copy and must not drift.

BEGIN;

CREATE TABLE IF NOT EXISTS admin_credentials (
    id            integer     PRIMARY KEY,
    password_hash text        NOT NULL,
    updated_at    timestamp   NOT NULL DEFAULT NOW(),
    CONSTRAINT admin_credentials_singleton CHECK (id = 1)
);

-- The app connects as `renostars`; created here as `postgres`, so hand it over
-- rather than leaving the app dependent on a grant nobody documented.
ALTER TABLE admin_credentials OWNER TO renostars;

-- No plaintext, ever. The row is written by `pnpm admin:password`, which
-- stores only the encoded scrypt hash.

COMMIT;
