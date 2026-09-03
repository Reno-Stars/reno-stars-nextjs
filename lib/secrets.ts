import 'server-only';

/**
 * Runtime secret resolution: process.env, then Infisical, then a database
 * bridge table (temporary — see TIER 3 below).
 *
 * WHY
 * ---
 * Delivering a secret to this app used to take TWO changes in two systems: the
 * value in Infisical, and a matching entry in the `reno-stars-web-secrets`
 * ExternalSecret (operator-only). Writing the vault alone changed nothing, and
 * nothing reported the gap.
 *
 * That is not hypothetical. Between 2026-08-14 and 2026-09-03 the contact form
 * accepted 7 submissions and delivered none, because RESEND_API_KEY and the
 * ODOO_* vars were never mapped into the pod. The pod was Ready, CI was green,
 * and the form told every visitor their message had been sent.
 *
 * Reading from the vault at runtime collapses N missing-variable failure modes
 * into ONE bootstrap credential. A new secret becomes self-serve: write it to
 * Infisical `/web` and the running app picks it up within the cache TTL, with
 * no operator round trip. And the single remaining dependency fails LOUDLY —
 * if the machine identity is absent or rejected, that is one obvious error, not
 * a feature quietly returning false forever.
 *
 * PRECEDENCE — process.env, then Infisical, then the DB bridge:
 *   - anything the ExternalSecret already provides keeps working unchanged
 *   - local dev and CI keep using .env / test env with no vault access
 *   - an operator can always override the vault in an emergency
 *   - the DB bridge is LAST, so it self-retires the moment either real source
 *     can answer. It exists only because the operator ask is still pending.
 *
 * Egress was verified from ns/reno-stars before adopting this:
 * `curl https://key.enteros.ai/api/status` -> HTTP 200 from an in-namespace pod.
 *
 * SECURITY: the pod holds a machine identity scoped to one Infisical path. That
 * is equivalent in blast radius to holding the secrets it can read, and no
 * worse than the ExternalSecret it replaces. Values are cached in memory only
 * and are never logged — failures log the KEY NAME, never the value.
 */

const CACHE_TTL_MS = 5 * 60_000;
/** After a failed load, wait this long before hammering the vault again. */
const FAILURE_BACKOFF_MS = 30_000;

interface VaultState {
  values: Map<string, string>;
  loadedAt: number;
}

/** Keys THIS module wrote into process.env; they are a cache, not a source. */
const hydratedKeys = new Set<string>();

let state: VaultState | null = null;
let lastFailureAt = 0;
let inFlight: Promise<VaultState | null> | null = null;
let missingIdentityLogged = false;

function vaultConfig() {
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const host = process.env.INFISICAL_HOST ?? 'https://key.enteros.ai';
  const projectSlug = process.env.INFISICAL_PROJECT_SLUG ?? 'reno-stars-2p-t5';
  const environment = process.env.INFISICAL_ENV ?? 'prod';
  const secretPath = process.env.INFISICAL_PATH ?? '/web';
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, host, projectSlug, environment, secretPath };
}

async function fetchVault(): Promise<VaultState | null> {
  const cfg = vaultConfig();
  if (!cfg) {
    if (!missingIdentityLogged) {
      missingIdentityLogged = true;
      // Not an error on its own: if the ExternalSecret supplies everything,
      // there is nothing for the vault to add. It matters only when a lookup
      // then misses, which getSecret reports separately.
      console.warn(
        JSON.stringify({
          event: 'secrets.vault.unconfigured',
          message:
            'INFISICAL_CLIENT_ID/INFISICAL_CLIENT_SECRET are not set; secrets resolve from process.env only.',
        }),
      );
    }
    return null;
  }

  const login = await fetch(`${cfg.host}/api/v1/auth/universal-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: cfg.clientId, clientSecret: cfg.clientSecret }),
    cache: 'no-store',
  });
  if (!login.ok) {
    throw new Error(`Infisical login failed: ${login.status} ${login.statusText}`);
  }
  const { accessToken } = (await login.json()) as { accessToken: string };

  // NOTE: the READ route wants `workspaceSlug`; the WRITE route wants
  // `projectSlug` and rejects the other. Easy to get backwards.
  const query = new URLSearchParams({
    workspaceSlug: cfg.projectSlug,
    environment: cfg.environment,
    secretPath: cfg.secretPath,
  });
  const res = await fetch(`${cfg.host}/api/v3/secrets/raw?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Infisical read failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { secrets?: { secretKey: string; secretValue: string }[] };
  const values = new Map<string, string>();
  for (const s of body.secrets ?? []) {
    if (s.secretValue) values.set(s.secretKey, s.secretValue);
  }
  return { values, loadedAt: Date.now() };
}

async function loadVault(): Promise<VaultState | null> {
  const now = Date.now();
  if (state && now - state.loadedAt < CACHE_TTL_MS) return state;
  if (!state && now - lastFailureAt < FAILURE_BACKOFF_MS) return null;
  if (inFlight) return inFlight; // collapse concurrent misses into one fetch

  inFlight = (async () => {
    try {
      const fresh = await fetchVault();
      if (fresh) state = fresh;
      return fresh;
    } catch (err) {
      lastFailureAt = Date.now();
      console.error(
        JSON.stringify({
          event: 'secrets.vault.unavailable',
          message: 'Could not read secrets from Infisical; falling back to process.env.',
          error: err instanceof Error ? err.message : String(err),
        }),
      );
      // Serve a stale cache rather than nothing — an expired value beats an
      // outage-induced "feature silently disabled".
      return state;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * TIER 3 — the database bridge.
 *
 * TEMPORARY. The migration left 25 runtime vars undeliverable, and the only
 * store this pod can reach without an operator is the database its
 * `DATABASE_URL` already points at. Consulted LAST, so it goes dormant the
 * moment process.env or Infisical can answer, and the table can then be
 * dropped. See scripts/create-app-secrets.sql for the security trade-off and
 * the mandatory REVOKE.
 *
 * Loaded lazily and cached like the vault. A failure here is logged once and
 * treated as "no value" — the database being unavailable must not turn a
 * missing optional secret into a crash.
 */
let dbState: VaultState | null = null;
let dbFailureAt = 0;
let dbInFlight: Promise<VaultState | null> | null = null;

async function loadDbSecrets(): Promise<VaultState | null> {
  const now = Date.now();
  if (dbState && now - dbState.loadedAt < CACHE_TTL_MS) return dbState;
  if (!dbState && now - dbFailureAt < FAILURE_BACKOFF_MS) return null;
  if (dbInFlight) return dbInFlight;

  dbInFlight = (async () => {
    try {
      // Imported lazily so a module that only needs env never pulls in the DB
      // client, and so this file stays safe to import from scripts.
      const [{ db }, { appSecrets }] = await Promise.all([
        import('@/lib/db'),
        import('@/lib/db/schema'),
      ]);
      const rows = await db.select({ key: appSecrets.key, value: appSecrets.value }).from(appSecrets);
      const values = new Map<string, string>();
      for (const r of rows) if (r.value) values.set(r.key, r.value);
      dbState = { values, loadedAt: Date.now() };
      return dbState;
    } catch (err) {
      dbFailureAt = Date.now();
      console.error(
        JSON.stringify({
          event: 'secrets.db.unavailable',
          message: 'Could not read the app_secrets bridge table.',
          error: err instanceof Error ? err.message : String(err),
        }),
      );
      return dbState;
    } finally {
      dbInFlight = null;
    }
  })();

  return dbInFlight;
}

/**
 * Resolve one secret: `process.env`, then Infisical, then the database bridge.
 * Returns undefined when none has it — callers decide how loud that is.
 */
export async function getSecret(name: string): Promise<string | undefined> {
  // A value we hydrated into process.env ourselves is a CACHE, not a source.
  // Letting it win tier 1 would freeze it for the life of the process and
  // silently destroy the "write it to Infisical and the app picks it up"
  // property that is the whole point of reading the vault at runtime.
  const fromEnv = hydratedKeys.has(name) ? undefined : process.env[name];
  if (fromEnv) return fromEnv;

  const vault = await loadVault();
  const fromVault = vault?.values.get(name);
  if (fromVault) return fromVault;

  const fromDb = await loadDbSecrets();
  const fromBridge = fromDb?.values.get(name);
  if (fromBridge) return fromBridge;

  // Last resort for a hydrated key: both remote tiers are down, so serve the
  // value we hydrated at boot rather than reporting the secret as missing.
  return hydratedKeys.has(name) ? process.env[name] : undefined;
}

/**
 * Copy every resolvable secret into `process.env` once, at server startup.
 *
 * WHY THIS IS NECESSARY
 * ---------------------
 * `getSecret` is async, so only async callers can use it. Much of the codebase
 * reads secrets synchronously, and some reads happen at MODULE LOAD:
 *
 *     // lib/cloudflare-purge.ts
 *     const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;   // frozen at import
 *
 * Those readers cannot await anything, so routing them through the vault would
 * mean converting a long chain of call sites to async — including React render
 * paths, where it is not always possible.
 *
 * The consequence, before this existed, was worse than inconvenient: it made
 * the health endpoint LIE. `/api/health/config` resolves through `getSecret`,
 * so it reported `cachePurge: ok` because the token is in the bridge — while
 * the code that actually purges read `process.env` and got `undefined`, and
 * no-opped. A monitor that measures a different thing than the runtime does is
 * the exact failure that let the contact form drop 7 leads while every signal
 * showed green.
 *
 * Hydrating at boot makes the two agree BY CONSTRUCTION: one resolution path,
 * one answer, for sync and async readers alike.
 *
 * Never overwrites a variable that is already set — an operator's explicit
 * value, and local dev's `.env`, still win.
 *
 * Logs the KEY NAMES it hydrated (never values), because "which secrets did
 * this pod have to fetch at boot" is exactly what you want in the log the
 * morning something is inert.
 */
export async function hydrateEnvFromSecrets(): Promise<string[]> {
  const [vault, bridge] = await Promise.all([loadVault(), loadDbSecrets()]);

  const merged = new Map<string, string>();
  // Bridge first, vault second: the vault is the more authoritative source, so
  // it overwrites the temporary bridge on conflict.
  for (const [k, v] of bridge?.values ?? []) merged.set(k, v);
  for (const [k, v] of vault?.values ?? []) merged.set(k, v);

  const hydrated: string[] = [];
  for (const [name, value] of merged) {
    if (process.env[name]) continue; // an explicit env var always wins
    process.env[name] = value;
    hydratedKeys.add(name);
    hydrated.push(name);
  }

  console.log(
    JSON.stringify({
      event: 'secrets.hydrated',
      count: hydrated.length,
      keys: hydrated.sort(),
      sources: { vault: vault?.values.size ?? 0, bridge: bridge?.values.size ?? 0 },
    }),
  );

  return hydrated;
}

/** Resolve several secrets in one pass (a single vault load covers them all). */
export async function getSecrets<T extends string>(
  names: readonly T[],
): Promise<Record<T, string | undefined>> {
  const out = {} as Record<T, string | undefined>;
  for (const n of names) out[n] = await getSecret(n);
  return out;
}

/** Test seam — module-level cache would otherwise leak between cases. */
export function resetSecretsCacheForTests(): void {
  state = null;
  lastFailureAt = 0;
  inFlight = null;
  missingIdentityLogged = false;
  dbState = null;
  dbFailureAt = 0;
  dbInFlight = null;
  for (const k of hydratedKeys) delete process.env[k];
  hydratedKeys.clear();
}
