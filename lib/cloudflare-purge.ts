/**
 * Cloudflare edge-cache purge.
 *
 * HTML pages are edge-cached by a Cloudflare Cache Rule (s-maxage=300). Origin
 * revalidation (updateTag / revalidatePath) makes the Mac origin fresh
 * instantly, but the EDGE keeps serving cached HTML until s-maxage expires
 * (≤5min). Purging the affected URLs here makes admin/SEO edits appear at the
 * edge immediately, closing that window.
 *
 * Fail-safe: if `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ZONE_ID` are unset, every
 * function is a no-op — the site behaves exactly as before (origin fresh, edge
 * ≤5min stale). Purge failures are logged, never thrown into the request.
 *
 * Token scope required: Zone → Cache Purge → Purge, for the reno-stars.com zone.
 */

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

function enabled(): boolean {
  return Boolean(ZONE_ID && API_TOKEN);
}

async function purgeCall(body: Record<string, unknown>): Promise<void> {
  if (!enabled()) return;
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[cf-purge] ${res.status} ${res.statusText}:`, (await res.text()).slice(0, 200));
    }
  } catch (err) {
    console.error('[cf-purge] request failed:', err);
  }
}

/**
 * Purge specific absolute URLs from the edge. Cloudflare accepts up to 30 URLs
 * per call; batch beyond that. Fire-and-forget from the caller.
 */
export async function purgeCloudflareUrls(urls: string[]): Promise<void> {
  if (!enabled() || urls.length === 0) return;
  for (let i = 0; i < urls.length; i += 30) {
    await purgeCall({ files: urls.slice(i, i + 30) });
  }
}

/**
 * Purge the ENTIRE zone. Use only for edits that touch every page (e.g. the
 * header/footer nav globals) — precise per-URL purge is preferred elsewhere.
 */
export async function purgeCloudflareEverything(): Promise<void> {
  await purgeCall({ purge_everything: true });
}
