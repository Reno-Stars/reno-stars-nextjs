import { logEvent, localeFromPath } from '@/lib/log';

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
