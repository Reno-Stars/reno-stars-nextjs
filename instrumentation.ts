import { logEvent, localeFromPath } from '@/lib/log';

/**
 * Runs once per server process, before the first request is handled.
 *
 * Pulls every secret we can resolve (Infisical, then the DB bridge) into
 * `process.env`, so that synchronous and module-load-time readers see the same
 * values `getSecret` sees. Without this, `/api/health/config` reports a
 * capability healthy while the code implementing it silently no-ops — see
 * `hydrateEnvFromSecrets` for the full reasoning.
 *
 * Deliberately non-fatal: a vault outage must degrade features, not refuse to
 * boot the website. Per-request `getSecret` calls retry on their own.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  try {
    const { hydrateEnvWithRetry } = await import('@/lib/secrets');
    // Retries past the pod's boot-time connection race — see hydrateEnvWithRetry.
    // Awaited: a request served before hydration reads an empty environment and
    // silently no-ops, which is the failure this whole mechanism exists to stop.
    // The retry gives up after ~15s, and only ever spends that when NO source is
    // reachable — a state in which the database-backed site is already down.
    await hydrateEnvWithRetry();
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'secrets.hydrate.failed',
        message: 'Boot-time secret hydration failed; features may be inert.',
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}

/**
 * Next.js error instrumentation. `onRequestError` fires for every server-side
 * render/route error with the request path + route context. We persist them to
 * Neon `app_log` (see lib/log.ts) because Vercel does not retain runtime logs —
 * this is how prod-only failures (which never reproduce locally) become
 * diagnosable. Query with `scripts/logs.mjs --level error`.
 */
type ReqErr = Error & { digest?: string };

export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string },
  context: { routePath?: string; routeType?: string; renderSource?: string },
): Promise<void> {
  const e = error as ReqErr;
  const path = request?.path ?? null;
  await logEvent({
    level: 'error',
    event: 'render_error',
    source: 'instrumentation',
    path,
    locale: localeFromPath(path),
    digest: e?.digest ?? null,
    msg: e?.message ?? String(error),
    stack: e?.stack ?? null,
    meta: {
      method: request?.method,
      routePath: context?.routePath,
      routeType: context?.routeType,
      renderSource: context?.renderSource,
    },
  });
}
