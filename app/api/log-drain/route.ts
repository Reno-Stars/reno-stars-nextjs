import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Vercel Log Drain receiver — comprehensive capture of runtime logs.
 *
 * Vercel does not retain runtime logs and `vercel logs` is empty in
 * non-interactive shells, so this endpoint subscribes to the project's log
 * stream and persists every line to Neon `vercel_log` (queryable via
 * `scripts/logs.mjs --vercel`). Errors/revalidations also have first-class
 * structured rows in `app_log` (see lib/log.ts); this is the raw firehose.
 *
 * Contract (Vercel Configurable Log Drains):
 *  - Ownership: respond to any request with header `x-vercel-verify: <token>`
 *    (token from LOG_DRAIN_VERIFY, shown when the drain is created).
 *  - Integrity: each POST body is signed `x-vercel-signature` = HMAC-SHA1 of the
 *    raw body with the drain secret (LOG_DRAIN_SECRET). We reject mismatches.
 *  - Payload: NDJSON (one JSON log object per line) by default.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VERIFY = process.env.LOG_DRAIN_VERIFY ?? '';
const SECRET = process.env.LOG_DRAIN_SECRET ?? '';

function withVerify(res: NextResponse): NextResponse {
  if (VERIFY) res.headers.set('x-vercel-verify', VERIFY);
  return res;
}

export async function GET(): Promise<NextResponse> {
  // Vercel hits the endpoint to verify ownership before activating the drain.
  return withVerify(NextResponse.json({ ok: true }));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw = await req.text();

  // Verify the HMAC-SHA1 signature when a secret is configured (fail closed).
  if (SECRET) {
    const sig = req.headers.get('x-vercel-signature') ?? '';
    const expected = crypto.createHmac('sha1', SECRET).update(raw).digest('hex');
    // timingSafeEqual needs equal-length buffers
    const ok = sig.length === expected.length
      && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) return withVerify(new NextResponse('invalid signature', { status: 401 }));
  }

  // NDJSON (one object per line) is the default; tolerate a JSON array too.
  const trimmed = raw.trim();
  let objs: Record<string, unknown>[] = [];
  if (trimmed.startsWith('[')) {
    try { objs = JSON.parse(trimmed); } catch { objs = []; }
  } else {
    objs = trimmed.split('\n').filter(Boolean).flatMap((line) => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
  }

  for (const o of objs) {
    const proxy = (o.proxy ?? {}) as Record<string, unknown>;
    try {
      await db.execute(sql`
        INSERT INTO vercel_log (vercel_id, source, level, message, path, status, host, request_id, raw)
        VALUES (
          ${(o.id as string) ?? null},
          ${(o.source as string) ?? null},
          ${(o.level as string) ?? null},
          ${o.message != null ? String(o.message).slice(0, 2000) : null},
          ${(proxy.path as string) ?? (o.path as string) ?? null},
          ${(proxy.statusCode as number) ?? (o.statusCode as number) ?? null},
          ${(proxy.host as string) ?? (o.host as string) ?? null},
          ${(o.requestId as string) ?? (proxy.requestId as string) ?? null},
          ${JSON.stringify(o)}::jsonb
        )
      `);
    } catch {
      /* best-effort */
    }
  }

  return withVerify(NextResponse.json({ ok: true, received: objs.length }));
}
