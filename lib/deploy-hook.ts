/**
 * Triggers a Vercel deployment via the configured deploy hook URL.
 *
 * Architecture context: as of 2026-05-04 the marketing site is fully-static
 * (SSG, no ISR). Admin edits don't surface on the public site until the
 * next build. This helper fires Vercel's deploy hook to trigger a rebuild
 * immediately after the admin server action finishes its DB write.
 *
 * Usage in admin server actions:
 *   import { triggerDeploy } from '@/lib/deploy-hook';
 *   ...
 *   await db.update(...);
 *   triggerDeploy('blog post update');  // fire-and-forget
 *   redirect('/admin/blog');
 *
 * The function is fire-and-forget by design — admin actions should NOT
 * await the deploy webhook (it'd block the user for ~500ms-2s for no
 * reason). The webhook just enqueues a build on Vercel; the build itself
 * runs in 2-4 minutes.
 *
 * No-op when VERCEL_DEPLOY_HOOK_URL isn't set (local dev, preview, or
 * platforms other than Vercel).
 */

let lastTrigger = 0;
// 10 min coalesce window — bumped from 30s on 2026-05-11 after audit found
// admin sessions firing 5-15 deploys/day, each one prerendering ~600 pages
// → millions of cache writes/week. 10min still collapses bursts within a
// single SEO sprint session but lets distinct sessions (morning edits +
// afternoon edits) each get their deploy.
//
// Known limitation: `lastTrigger` is per-Lambda-instance memory, so Vercel
// cold-starts reset it. The deploy hook is still best-effort dedup, not
// strict rate-limit. If we ever see this isn't enough, persist
// `last_deploy_at` in a Neon row or call Vercel's deployments API to read
// the actual last-deploy timestamp before firing.
const COALESCE_WINDOW_MS = 600_000;

export function triggerDeploy(reason: string): void {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return;

  // Coalesce bursts. See COALESCE_WINDOW_MS comment above for tradeoffs.
  const now = Date.now();
  if (now - lastTrigger < COALESCE_WINDOW_MS) return;
  lastTrigger = now;

  // Fire-and-forget. We don't await the response — the admin action
  // doesn't care whether the build was queued, only that we asked for it.
  // Errors are logged but never propagated.
  fetch(url, { method: 'POST' })
    .then((r) => {
      if (!r.ok) {
        console.warn(`[deploy-hook] ${reason}: webhook returned ${r.status}`);
      }
    })
    .catch((err) => {
      console.warn(`[deploy-hook] ${reason}: fetch failed`, err);
    });
}
