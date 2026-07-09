import { headers } from 'next/headers';

/**
 * Trusted client IP for rate-limiting.
 *
 * Production is reachable ONLY through the Cloudflare Tunnel, so
 * `cf-connecting-ip` is set by Cloudflare and cannot be spoofed by the client
 * (the origin has no other ingress). `x-forwarded-for` / `x-real-ip` ARE
 * client-controllable — Cloudflare appends the real IP to any inbound XFF
 * rather than replacing it — so a rate limiter keyed on those is trivially
 * defeated by rotating the header (each guess lands in a fresh bucket).
 *
 * Order: cf-connecting-ip (trusted) → true-client-ip (Cloudflare Enterprise)
 * → x-real-ip / x-forwarded-for (dev / other proxies only) → 'unknown'.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const cf = h.get('cf-connecting-ip') || h.get('true-client-ip');
  if (cf) return cf.trim();
  // Non-Cloudflare paths (local dev, direct origin hit). Spoofable — acceptable
  // only because production ingress is Cloudflare-only.
  const realIp = h.get('x-real-ip');
  if (realIp) return realIp.trim();
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown-ip';
}
