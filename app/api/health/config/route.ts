import { missingLeadSecrets } from '@/lib/lead-delivery-config';
import { getSecret } from '@/lib/secrets';

/**
 * Configuration health — the monitorable answer to "can this deployment
 * actually do its job?".
 *
 * WHY THIS EXISTS
 * ---------------
 * Between 2026-08-14 and 2026-09-03 the cluster deployment carried 8 of the
 * website's 34 runtime variables. Email, CRM ingestion, Cloudflare cache
 * purging, on-demand revalidation, blog publishing, uploads and the AI features
 * were all inert, and the contact form accepted 7 customer enquiries and
 * delivered none.
 *
 * Nothing detected it for twenty days, because a missing variable fails at
 * FIRST USE, not at boot. Every signal anyone watches said healthy: the pod was
 * `1/1 Ready`, the liveness probe passed (it fetches `/`, which needs no
 * credential), CI was green, and the site served 200s throughout.
 *
 * Liveness answers "is the process up". This answers "is the process able to
 * do the things it exists to do" — which is the question that was never asked.
 * The blackbox probe checks it every 300s, so a deployment that loses its
 * credentials alerts within minutes rather than being noticed when someone
 * happens to wonder why the inbox is quiet.
 *
 * DISCLOSURE: unauthenticated callers get an aggregate only — per-channel
 * ok/degraded, never which variable is missing. Naming the absent variables is
 * useful for debugging and mildly useful to an attacker, so the detail requires
 * the same bearer token as /api/revalidate. No secret VALUE is ever returned at
 * any authorisation level.
 */
export const dynamic = 'force-dynamic';

/** Non-lead capabilities worth reporting; each is silently inert without its key. */
const CAPABILITY_SECRETS: Record<string, string[]> = {
  cachePurge: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'],
  revalidation: ['REVALIDATE_SECRET'],
  uploads: ['S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET', 'S3_ENDPOINT'],
  ai: ['OPENAI_API_KEY'],
  blogPublish: ['BLOG_API_SECRET'],
};

async function missingFor(names: string[]): Promise<string[]> {
  const missing: string[] = [];
  for (const n of names) if (!(await getSecret(n))) missing.push(n);
  return missing;
}

export async function GET(request: Request) {
  const lead = await missingLeadSecrets();

  const capabilities: Record<string, string[]> = {};
  for (const [name, names] of Object.entries(CAPABILITY_SECRETS)) {
    capabilities[name] = await missingFor(names);
  }

  const groups = { ...lead, ...capabilities };
  const degraded = Object.entries(groups)
    .filter(([, missing]) => missing.length > 0)
    .map(([name]) => name);

  // `alerting` degraded on its own does not make the site unhealthy — it means
  // we would not be TOLD about a failure, which is worth surfacing but is not
  // itself a customer-visible outage.
  const criticalDegraded = degraded.filter((g) => g !== 'alerting');
  const ok = criticalDegraded.length === 0;

  const secret = await getSecret('REVALIDATE_SECRET');
  const authorized =
    Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;

  const body = authorized
    ? { ok, degraded, missing: groups }
    : { ok, degraded };

  return Response.json(body, {
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
