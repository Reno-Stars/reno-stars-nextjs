import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Structured, queryable logging into Neon `app_log`.
 *
 * Why this exists: Vercel does NOT retain runtime logs, and `vercel logs` emits
 * nothing in non-interactive shells (CI, crons, this agent). During the
 * 2026-06 ISR investigation we were effectively blind — every diagnosis needed
 * an ad-hoc Neon table. This is the permanent replacement: anything worth seeing
 * later (server errors, revalidations, notable events) lands in one indexed
 * table you can query from anywhere (see `scripts/logs.mjs`).
 *
 * Best-effort: `logEvent` NEVER throws — a logging failure must not break the
 * request it is describing. For comprehensive raw runtime capture (every
 * console line / edge log), see the Log Drain receiver at
 * `app/api/log-drain/route.ts`, which writes to `vercel_log`.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogInput {
  level?: LogLevel;
  /** Short stable identifier, e.g. `render_error`, `revalidate`, `redirect`. */
  event: string;
  /** Where it came from, e.g. `instrumentation`, `revalidate`, `app`. */
  source?: string;
  path?: string | null;
  locale?: string | null;
  status?: number | null;
  digest?: string | null;
  msg?: string | null;
  stack?: string | null;
  meta?: unknown;
}

/** Best-effort insert into `app_log`. Never throws. */
export async function logEvent(input: LogInput): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO app_log (level, event, source, path, locale, status, digest, msg, stack, meta)
      VALUES (
        ${input.level ?? 'info'},
        ${input.event},
        ${input.source ?? null},
        ${input.path ?? null},
        ${input.locale ?? null},
        ${input.status ?? null},
        ${input.digest ?? null},
        ${input.msg != null ? String(input.msg).slice(0, 1000) : null},
        ${input.stack != null ? String(input.stack).slice(0, 4000) : null},
        ${input.meta != null ? JSON.stringify(input.meta) : null}::jsonb
      )
    `);
  } catch {
    /* logging is best-effort — never break the caller */
  }
}

/** Convenience: derive the locale from a `/xx/...` path's first segment. */
export function localeFromPath(path?: string | null): string | null {
  if (!path) return null;
  const seg = path.split('/').filter(Boolean)[0];
  return seg || null;
}
