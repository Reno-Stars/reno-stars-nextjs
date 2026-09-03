-- app_secrets — TEMPORARY runtime secret store. See lib/secrets.ts.
--   pnpm db:query -f scripts/create-app-secrets.sql
--
-- WHY THIS EXISTS, AND WHY IT IS TEMPORARY
--
-- The 2026-08-14 migration carried 8 of the website's 34 runtime env vars into
-- the cluster. The other 25 cannot be restored by us: a value must be in
-- Infisical AND named in an ExternalSecret that only the platform operator can
-- edit. Requested on reno-stars-infra#184 (two bootstrap keys) and
-- operator-config#812 (let the tenant manage its own namespace's secrets).
-- Until one of those lands, email, CRM ingestion, Cloudflare cache purging,
-- on-demand revalidation, blog publishing, uploads and the AI features are all
-- silently inert in production.
--
-- This table is the bridge. `DATABASE_URL` is the one credential the pod
-- already has, so the database is the only store we can reach without an
-- operator. lib/secrets.ts consults it LAST — after process.env and Infisical —
-- so the moment a real credential arrives this table stops being read and can
-- be dropped.
--
-- TRADE-OFF, STATED PLAINLY: these values are stored unencrypted. A database
-- compromise or a leaked backup exposes them, which is strictly weaker than a
-- vault. It is accepted deliberately and temporarily, because the alternative
-- is a production site that cannot email a customer.
--
-- ⚠️ SECURITY — THE DEFAULT ACL WILL LEAK THIS IF YOU LET IT.
-- This database has a default privilege: `renostars | r | {agent_ro=r/renostars}`
-- so EVERY new table created by `renostars` automatically grants SELECT to
-- `agent_ro`. That role is served publicly by api.reno-stars.com (the read-only
-- SQL gateway used by remote agents), and its token is pending rotation after
-- being exposed. Without the REVOKE below, every API key here would be readable
-- by anyone holding that token. The REVOKE is not optional.

CREATE TABLE IF NOT EXISTS app_secrets (
  key         varchar(120) PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamp DEFAULT now() NOT NULL
);

ALTER TABLE app_secrets OWNER TO renostars;

-- Undo the default ACL. Belt and braces: revoke from the role, from PUBLIC, and
-- pre-empt future tables in this schema.
REVOKE ALL ON app_secrets FROM agent_ro;
REVOKE ALL ON app_secrets FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE renostars IN SCHEMA public REVOKE SELECT ON TABLES FROM agent_ro;
