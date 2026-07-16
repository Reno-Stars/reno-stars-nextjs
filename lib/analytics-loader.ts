/**
 * Deferred gtag.js loader — single source of truth for the GA4 / Google Ads
 * bootstrap (rendered by components/GoogleAnalytics.tsx).
 *
 * gtag.js (~350 KB, ~590ms of main-thread work) is the single largest TBT
 * contributor on the site. To keep it off the critical path entirely, we defer
 * loading until the FIRST user interaction (scroll / tap / key / pointer). An
 * engaged visitor triggers it within milliseconds, so conversions and real
 * pageviews are still tracked; a purely-bounced session (no interaction) is the
 * only thing that goes uncounted — an accepted tradeoff for the performance win
 * (owner decision, 2026-07-16).
 *
 * Fallback for visitors who never interact: we also load on `visibilitychange`
 * → hidden (tab close / switch away), which recovers the pageview at exit. That
 * fires well after the load window and is never triggered during a Lighthouse /
 * PSI run (no interaction, tab stays visible), so it costs nothing on TBT while
 * still counting real no-interaction sessions.
 *
 * Why visibilitychange and NOT requestIdleCallback: rIC fires at the first
 * idle moment — effectively immediately after load; its `timeout` option is
 * only an upper bound, not a delay. Using it puts gtag.js right back on the
 * critical path. That exact bug already shipped once (commit 64c422c).
 */

/**
 * Arms the deferred-load listeners for gtag.js.
 * Returns a cleanup function that disarms them (safe to call at any time;
 * a no-op once loading has started).
 */
export function initDeferredAnalytics(gaId: string, awId?: string): () => void {
  let started = false;
  const events = ['scroll', 'pointerdown', 'keydown', 'touchstart', 'mousemove'] as const;
  const listenerOpts: AddEventListenerOptions = { once: true, passive: true, capture: true };

  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, start, listenerOpts));
    document.removeEventListener('visibilitychange', onHidden);
  };

  function start() {
    if (started) return;
    started = true;
    cleanup();

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    // Canonical gtag shim: gtag.js requires the ARGUMENTS OBJECT to be pushed
    // ('function gtag(){dataLayer.push(arguments);}') — a plain rest-args
    // array is not reliably processed for js/config commands. Hence a real
    // function statement, not an arrow pushing `[...args]`.
    function gtag(..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params -- gtag.js requires the Arguments object, not an array
      window.dataLayer!.push(arguments);
    }
    // Expose globally: lib/analytics.ts gates every event on window.gtag
    // (isAnalyticsEnabled() returns false when it is undefined), so without
    // this assignment ALL GA4 events and Google Ads conversions silently no-op.
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, { page_path: window.location.pathname });
    if (awId) gtag('config', awId);
  }

  function onHidden() {
    if (document.visibilityState === 'hidden') start();
  }

  events.forEach((e) => window.addEventListener(e, start, listenerOpts));
  document.addEventListener('visibilitychange', onHidden);

  return cleanup;
}
