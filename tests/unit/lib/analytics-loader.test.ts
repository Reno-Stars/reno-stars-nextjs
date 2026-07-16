import { describe, it, expect, afterEach } from 'vitest';
import { initDeferredAnalytics } from '@/lib/analytics-loader';

const GA_ID = 'G-TEST123';
const AW_ID = 'AW-456789';

const scriptSelector = 'script[src^="https://www.googletagmanager.com/gtag/js"]';

/** Cleanup returned by the init under test, invoked in afterEach to avoid listener leaks. */
let cleanupFn: (() => void) | undefined;

function setVisibilityState(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

afterEach(() => {
  cleanupFn?.();
  cleanupFn = undefined;
  delete window.gtag;
  delete window.dataLayer;
  document.head.querySelectorAll('script').forEach((s) => s.remove());
  // Revert any instance-level visibilityState override back to the prototype getter.
  Reflect.deleteProperty(document, 'visibilityState');
});

describe('initDeferredAnalytics', () => {
  it('does not load gtag.js or define window.gtag before any interaction', () => {
    cleanupFn = initDeferredAnalytics(GA_ID);

    expect(document.head.querySelector(scriptSelector)).toBeNull();
    expect(window.gtag).toBeUndefined();
    expect(window.dataLayer).toBeUndefined();
  });

  it('loads on first scroll: appends the script, assigns window.gtag, pushes Arguments objects', () => {
    cleanupFn = initDeferredAnalytics(GA_ID);
    window.dispatchEvent(new Event('scroll'));

    const script = document.head.querySelector<HTMLScriptElement>(scriptSelector);
    expect(script).not.toBeNull();
    expect(script!.src).toContain(GA_ID);
    expect(script!.async).toBe(true);

    // THE FIX under test: lib/analytics.ts gates every event on window.gtag.
    expect(typeof window.gtag).toBe('function');

    const dl = window.dataLayer!;
    expect(dl).toHaveLength(2);
    // gtag.js requires the Arguments object, NOT a plain array.
    const first = dl[0] as IArguments;
    expect(Array.isArray(first)).toBe(false);
    expect(first[0]).toBe('js');
    expect(first[1]).toBeInstanceOf(Date);
    const second = dl[1] as IArguments;
    expect(second[0]).toBe('config');
    expect(second[1]).toBe(GA_ID);
    expect(second[2]).toEqual({ page_path: window.location.pathname });
  });

  it('pushes a third config entry for the Google Ads id when awId is provided', () => {
    cleanupFn = initDeferredAnalytics(GA_ID, AW_ID);
    window.dispatchEvent(new Event('scroll'));

    const dl = window.dataLayer!;
    expect(dl).toHaveLength(3);
    const third = dl[2] as IArguments;
    expect(Array.isArray(third)).toBe(false);
    expect(third[0]).toBe('config');
    expect(third[1]).toBe(AW_ID);
  });

  it('loads via the visibilitychange → hidden fallback without any interaction', () => {
    cleanupFn = initDeferredAnalytics(GA_ID);

    setVisibilityState('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.head.querySelector(scriptSelector)).not.toBeNull();
    expect(typeof window.gtag).toBe('function');
  });

  it('does not load twice on repeated interactions', () => {
    cleanupFn = initDeferredAnalytics(GA_ID);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    setVisibilityState('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.head.querySelectorAll(scriptSelector)).toHaveLength(1);
    expect(window.dataLayer).toHaveLength(2);
  });

  it('cleanup() before any interaction disarms loading entirely', () => {
    const cleanup = initDeferredAnalytics(GA_ID);
    cleanup();

    window.dispatchEvent(new Event('scroll'));
    setVisibilityState('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(document.head.querySelector(scriptSelector)).toBeNull();
    expect(window.gtag).toBeUndefined();
    expect(window.dataLayer).toBeUndefined();
  });
});
