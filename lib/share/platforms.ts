import {
  FacebookIcon, XIcon, PinterestIcon, WhatsappIcon, TelegramIcon, RedditIcon,
  ThreadsIcon, BlueskyIcon, TumblrIcon, VkIcon, WeiboIcon, LineIcon, ZaloIcon,
  QzoneIcon, MessengerIcon, ViberIcon, WechatIcon,
  LinkedinIcon, EmailIcon, CopyIcon, NativeIcon, SmsIcon,
} from '@/components/share/ShareIcons';
import { enc } from './url';
import type { PlatformId, ShareTarget } from './types';

/** Reaches only a device with the app installed — a dead button on desktop. */
const mobileOnly = (_ctx: unknown, env: { isMobile: boolean }) => env.isMobile;

/**
 * What each platform IS: identity and behavior. Deliberately no audience or
 * ordering data — that lives in `matrix.ts`. Keeping a `locales` array here
 * alongside the matrix would give ordering two sources of truth.
 *
 * Every entry's `href` receives a ctx whose `url` is already tagged (or
 * deliberately clean) by `buildShareUrl`.
 */
export const PLATFORMS: Record<PlatformId, ShareTarget> = {
  facebook: {
    id: 'facebook', labelKey: 'share.facebook', icon: FacebookIcon, mode: 'popup',
    href: (c) => `https://www.facebook.com/sharer/sharer.php?u=${enc(c.url)}`,
  },
  x: {
    id: 'x', labelKey: 'share.x', icon: XIcon, mode: 'popup',
    href: (c) => `https://x.com/intent/post?url=${enc(c.url)}&text=${enc(c.title)}`,
  },
  linkedin: {
    id: 'linkedin', labelKey: 'share.linkedin', icon: LinkedinIcon, mode: 'popup',
    href: (c) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(c.url)}`,
  },
  pinterest: {
    id: 'pinterest', labelKey: 'share.pinterest', icon: PinterestIcon, mode: 'popup',
    // A pin with no image is a dead pin, so this hides itself rather than
    // producing one. Renovation before/afters are native Pinterest content —
    // worth the conditional.
    enabled: (c) => Boolean(c.imageUrl),
    href: (c) =>
      `https://www.pinterest.com/pin/create/button/?url=${enc(c.url)}&media=${enc(c.imageUrl ?? '')}&description=${enc(c.title)}`,
  },
  whatsapp: {
    id: 'whatsapp', labelKey: 'share.whatsapp', icon: WhatsappIcon, mode: 'popup',
    href: (c) => `https://wa.me/?text=${enc(`${c.title} ${c.url}`)}`,
  },
  telegram: {
    id: 'telegram', labelKey: 'share.telegram', icon: TelegramIcon, mode: 'popup',
    href: (c) => `https://t.me/share/url?url=${enc(c.url)}&text=${enc(c.title)}`,
  },
  reddit: {
    id: 'reddit', labelKey: 'share.reddit', icon: RedditIcon, mode: 'popup',
    href: (c) => `https://www.reddit.com/submit?url=${enc(c.url)}&title=${enc(c.title)}`,
  },
  threads: {
    id: 'threads', labelKey: 'share.threads', icon: ThreadsIcon, mode: 'popup',
    href: (c) => `https://www.threads.net/intent/post?text=${enc(`${c.title} ${c.url}`)}`,
  },
  bluesky: {
    id: 'bluesky', labelKey: 'share.bluesky', icon: BlueskyIcon, mode: 'popup',
    href: (c) => `https://bsky.app/intent/compose?text=${enc(`${c.title} ${c.url}`)}`,
  },
  tumblr: {
    id: 'tumblr', labelKey: 'share.tumblr', icon: TumblrIcon, mode: 'popup',
    href: (c) => `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${enc(c.url)}&title=${enc(c.title)}`,
  },
  vk: {
    id: 'vk', labelKey: 'share.vk', icon: VkIcon, mode: 'popup',
    href: (c) => `https://vk.com/share.php?url=${enc(c.url)}&title=${enc(c.title)}`,
  },
  weibo: {
    id: 'weibo', labelKey: 'share.weibo', icon: WeiboIcon, mode: 'popup',
    href: (c) => `https://service.weibo.com/share/share.php?url=${enc(c.url)}&title=${enc(c.title)}`,
  },
  line: {
    id: 'line', labelKey: 'share.line', icon: LineIcon, mode: 'popup',
    href: (c) => `https://social-plugins.line.me/lineit/share?url=${enc(c.url)}`,
  },
  zalo: {
    id: 'zalo', labelKey: 'share.zalo', icon: ZaloIcon, mode: 'popup',
    href: (c) => `https://sp.zalo.me/plugins/share?u=${enc(c.url)}`,
  },
  qzone: {
    id: 'qzone', labelKey: 'share.qzone', icon: QzoneIcon, mode: 'popup',
    href: (c) =>
      `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${enc(c.url)}&title=${enc(c.title)}`,
  },
  messenger: {
    // The deep link, NOT facebook.com/dialog/send — that needs a registered FB
    // app id this site does not have. Deep link needs none, but only works
    // where the app exists, hence mobileOnly.
    id: 'messenger', labelKey: 'share.messenger', icon: MessengerIcon, mode: 'navigate',
    enabled: mobileOnly,
    href: (c) => `fb-messenger://share?link=${enc(c.url)}`,
  },
  viber: {
    id: 'viber', labelKey: 'share.viber', icon: ViberIcon, mode: 'navigate',
    enabled: mobileOnly,
    href: (c) => `viber://forward?text=${enc(`${c.title} ${c.url}`)}`,
  },
  sms: {
    id: 'sms', labelKey: 'share.sms', icon: SmsIcon, mode: 'navigate',
    enabled: mobileOnly,
    href: (c) => `sms:?&body=${enc(`${c.title} ${c.url}`)}`,
  },
  email: {
    id: 'email', labelKey: 'share.email', icon: EmailIcon, mode: 'navigate',
    href: (c) => `mailto:?subject=${enc(c.title)}&body=${enc(`${c.title}\n\n${c.url}`)}`,
  },
  wechat: {
    // WeChat cannot be shared to by URL at all — the only real mechanism is a
    // QR the visitor scans in-app. Hence a modal, not a link. The href stays
    // the page itself so the no-JS fallback is harmless rather than broken.
    id: 'wechat', labelKey: 'share.wechat', icon: WechatIcon, mode: 'qr',
    href: (c) => c.url,
  },
  copy: {
    id: 'copy', labelKey: 'share.copy', icon: CopyIcon, mode: 'copy',
    href: (c) => c.url,
  },
  native: {
    id: 'native', labelKey: 'share.native', icon: NativeIcon, mode: 'native',
    enabled: (_c, env) => env.hasNativeShare,
    href: (c) => c.url,
  },
};
