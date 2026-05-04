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
const COALESCE_WINDOW_MS = 30_000;

export function triggerDeploy(reason: string): void {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return;

  // Coalesce bursts: an admin saving 3 forms back-to-back should only
  // produce one deploy, not three. 30s window is short enough that
  // staggered edits within the same UI session collapse, long enough
  // that a quick "save → refresh → save again" still triggers a second
  // build.
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
