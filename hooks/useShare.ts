'use client';

import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { buildShareUrl } from '@/lib/share/url';
import { SSR_ENV, type ShareContentType, type ShareContext, type ShareEnv, type ShareTarget } from '@/lib/share/types';

const COPIED_RESET_MS = 2000;

/**
 * Capability probe. `pointer: coarse` stands in for "this device plausibly has
 * the apps installed" — more honest than UA sniffing, which lies both ways.
 */
function detectEnv(): ShareEnv {
  return {
    isMobile: window.matchMedia('(pointer: coarse)').matches,
    hasNativeShare: typeof navigator.share === 'function',
  };
}

/** GA4's *recommended* `share` event — the reserved name, so it lands in the
 *  built-in engagement reports with no GA4-side configuration. */
function track(method: string, contentType: ShareContentType, itemId: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'share', { method, content_type: contentType, item_id: itemId });
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or a non-focused document — fall through to the
      // textarea path rather than failing the copy outright.
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

interface UseShareOptions {
  ctx: ShareContext;
  contentType: ShareContentType;
  itemId: string;
}

/**
 * Every side effect the share bar has. Components stay presentational.
 *
 * `env` starts at SSR_ENV and is replaced after mount — deciding capabilities
 * on the server would guarantee a hydration mismatch, so mobile-only targets
 * and the native sheet appear one frame late by design.
 */
export function useShare({ ctx, contentType, itemId }: UseShareOptions) {
  const [env, setEnv] = useState<ShareEnv>(SSR_ENV);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => { setEnv(detectEnv()); }, []);

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), COPIED_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  /** The outbound URL for a target: UTM-tagged, except where the visitor sees
   *  the URL themselves (copy / native). */
  const hrefFor = useCallback(
    (target: ShareTarget) => target.href({ ...ctx, url: buildShareUrl(ctx.url, target) }),
    [ctx],
  );

  const activate = useCallback(
    async (target: ShareTarget, event: MouseEvent<HTMLAnchorElement>) => {
      const href = hrefFor(target);
      track(target.id, contentType, itemId);

      switch (target.mode) {
        case 'newTab':
        case 'navigate':
          // The anchor's own href (+ target) does the work. Do NOT intercept:
          // calling window.open here as well is what made every share open a
          // popup and navigate the current tab. See DeliveryMode in types.ts.
          return;

        case 'copy':
          event.preventDefault();
          if (await copyToClipboard(href)) setCopiedId(target.id);
          return;

        case 'qr':
          event.preventDefault();
          setQrOpen(true);
          return;

        case 'native':
          event.preventDefault();
          try {
            await navigator.share({ title: ctx.title, url: href });
          } catch {
            // Dismissing the OS sheet rejects with AbortError. That is the user
            // changing their mind, not a failure — there is nothing to report
            // and nothing to fall back to.
          }
          return;
      }
    },
    [hrefFor, contentType, itemId, ctx.title],
  );

  return { env, activate, hrefFor, copiedId, qrOpen, closeQr: useCallback(() => setQrOpen(false), []) };
}
