import type { ComponentType, SVGProps } from 'react';

/**
 * Every platform the share bar knows how to reach. Adding one means adding its
 * id here, an entry in `platforms.ts`, and the id to whichever rows of
 * `matrix.ts` should see it — no component changes.
 *
 * Notably absent, and not oversights:
 *  - `xiaohongshu` — exposes no web share URL and no QR-scan share endpoint.
 *    There is literally nothing for a button to point at.
 *  - `kakaotalk` — needs the Kakao JS SDK plus a registered app key and domain.
 *    Account provisioning, not code. Korean readers reach it via `native`.
 */
export type PlatformId =
  | 'facebook' | 'x' | 'linkedin' | 'pinterest' | 'whatsapp' | 'telegram'
  | 'reddit' | 'threads' | 'bluesky' | 'tumblr' | 'vk' | 'weibo' | 'line'
  | 'zalo' | 'qzone' | 'messenger' | 'viber' | 'sms' | 'email' | 'wechat'
  | 'copy' | 'native';

/**
 * What a click does, on top of the plain `<a href>` every button already is.
 *
 *  - `popup`    — window.open at 600x540; falls back to navigation if blocked.
 *  - `navigate` — plain link, no interception (mailto:, app deep links).
 *  - `copy`     — Clipboard API, with a hidden-textarea fallback.
 *  - `qr`       — opens the lazily-loaded WeChat QR modal.
 *  - `native`   — navigator.share(); the OS sheet reaches Instagram/TikTok/Messages.
 */
export type DeliveryMode = 'popup' | 'navigate' | 'copy' | 'qr' | 'native';

/** The page being shared. `url` is always the clean canonical — UTM tagging is
 *  applied per-target by `buildShareUrl`, never baked in here. */
export interface ShareContext {
  url: string;
  title: string;
  imageUrl?: string;
}

/**
 * Runtime capabilities. Resolved AFTER mount, never on the server: `navigator`
 * does not exist during SSR, so deciding server-side would guarantee a
 * hydration mismatch. `SSR_ENV` below is what the server and the first client
 * render both see, which is what keeps them identical.
 */
export interface ShareEnv {
  isMobile: boolean;
  hasNativeShare: boolean;
}

/** The pre-mount value. Mobile-only targets and the native sheet are hidden
 *  until a real capability check replaces this, so the server and the first
 *  client render agree. */
export const SSR_ENV: ShareEnv = { isMobile: false, hasNativeShare: false };

export interface ShareTarget {
  id: PlatformId;
  /** next-intl key, e.g. 'share.facebook'. */
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mode: DeliveryMode;
  /** Builds the outbound URL. `ctx.url` arrives already UTM-tagged (or
   *  deliberately clean — see `buildShareUrl`). */
  href: (ctx: ShareContext) => string;
  /** Omit when unconditional. Return false to drop the target entirely. */
  enabled?: (ctx: ShareContext, env: ShareEnv) => boolean;
}

/** Feeds GA4's `item_id` / `content_type`. */
export type ShareContentType = 'blog' | 'project';
