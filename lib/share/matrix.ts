import type { Locale } from '@/i18n/config';
import type { PlatformId } from './types';

/**
 * Who sees which platforms, and in what order. This is the ONLY thing that
 * decides ordering — order is the array index. `platforms.ts` deliberately
 * carries no `locales` or `priority` field; two sources of truth for ordering
 * is how a matrix like this rots.
 *
 * The rows are a bet on how each audience actually shares, not a translation of
 * the English row. A LinkedIn button is dead weight to a zh reader who wants
 * WeChat, and that asymmetry is the entire point of a 14-locale site having a
 * locale-aware share bar.
 *
 * Targets a row omits are unreachable for that locale — a deliberate cut, not
 * an oversight. Add an id to a row to give that audience the platform.
 */
export const LOCALE_TARGETS: Record<Locale, PlatformId[]> = {
  en: ['facebook', 'x', 'linkedin', 'pinterest', 'whatsapp', 'reddit', 'threads', 'bluesky', 'messenger', 'tumblr', 'sms'],
  fr: ['facebook', 'x', 'linkedin', 'whatsapp', 'pinterest', 'telegram', 'threads', 'messenger', 'sms'],
  es: ['whatsapp', 'facebook', 'x', 'messenger', 'telegram', 'pinterest', 'threads', 'sms'],
  // Philippines skews hard to Facebook/Messenger; Viber is still widely used.
  tl: ['facebook', 'messenger', 'whatsapp', 'x', 'viber', 'telegram', 'pinterest', 'sms'],
  // Mainland: WeChat/Weibo/QQ are the whole game. X and Facebook are here for
  // overseas Mandarin readers, who are a real slice of this site's zh traffic.
  zh: ['wechat', 'weibo', 'qzone', 'x', 'facebook', 'line'],
  // HK/TW: LINE is dominant, Weibo much less so than mainland.
  'zh-Hant': ['wechat', 'line', 'facebook', 'x', 'weibo', 'threads', 'telegram'],
  ja: ['line', 'x', 'facebook', 'threads', 'pinterest', 'tumblr'],
  // No KakaoTalk: it needs the Kakao JS SDK + a registered app key. Korean
  // readers reach it through the native sheet meanwhile. Tracked as a follow-up.
  ko: ['x', 'facebook', 'line', 'threads', 'pinterest'],
  hi: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
  pa: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
  ar: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
  fa: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
  ru: ['telegram', 'vk', 'whatsapp', 'viber', 'x', 'facebook'],
  vi: ['facebook', 'zalo', 'messenger', 'telegram', 'x', 'viber', 'pinterest'],
};

/** Appended to every locale, in this order, after that locale's own targets.
 *  `native` last because it is the catch-all that reaches everything else. */
export const UNIVERSAL_TAIL: PlatformId[] = ['email', 'copy', 'native'];

/** How many buttons render before the "More" disclosure. resolveTargets returns
 *  the full list regardless — this only governs what is visible, so coverage
 *  can be comprehensive without the UI becoming a wall of buttons. */
export const VISIBLE_CAP = { desktop: 8, mobile: 5 } as const;
