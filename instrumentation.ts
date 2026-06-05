// TEMPORARY DIAGNOSTIC (2026-06-05): capture server render errors (e.g. the
// prod-only /ja/ + /ko/ homepage 500s that don't reproduce locally) into a Neon
// `error_log` table we can query directly. Next's onRequestError hook receives
// every server error with the request path + route context. Remove this file +
// drop table error_log once the cause is confirmed.
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

type ReqErr = Error & { digest?: string };

export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string },
  context: { routePath?: string; routeType?: string; renderSource?: string },
): Promise<void> {
  try {
    const e = error as ReqErr;
    await db.execute(sql`INSERT INTO error_log (path, route, msg, stack, digest) VALUES (
      ${request?.path ?? null},
      ${context?.routePath ?? null},
      ${(e?.message ?? String(error)).slice(0, 500)},
      ${(e?.stack ?? '').slice(0, 3000)},
      ${e?.digest ?? null}
    )`);
  } catch {
    /* diagnostic logging is best-effort */
  }
}
