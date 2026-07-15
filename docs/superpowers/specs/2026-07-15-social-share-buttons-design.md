# Social Share Buttons — Design

**Date:** 2026-07-15
**Status:** Approved, ready for implementation plan
**Scope:** Blog post pages and project detail pages

## Goal

Let a reader share a blog post or project page to the platforms their locale
actually uses, from a share bar that is dynamic (locale-aware), robust (works
without JS, no hydration mismatch), and atomized (adding a platform is one data
entry, not a code change).

Inspired by the Jetpack "Share this:" row, rebuilt for this site's design system
and its 14 locales.

## Non-goals

- **No "Like this:" counter.** Explicitly cut. It needs persistence, anonymous
  dedupe, and a client fetch to escape the 300s Cloudflare HTML edge cache.
  Separate project if ever wanted.
- **No KakaoTalk.** Requires the Kakao JS SDK plus a registered app key and
  domain — an account-provisioning task. Tracked as a follow-up. Korean visitors
  reach KakaoTalk via the native share sheet meanwhile.
- **No Xiaohongshu.** It exposes no web share URL and no QR-scan share endpoint.
  There is nothing for a button to link to.
- **No share bar on** service, area, home, or listing pages in this slice. The
  abstraction makes adding them later a one-line change.

## Architecture

Ten files. Dependencies point one way only:
pages → `ShareBar` → layouts → `ShareButton` → registry data.
`ShareButton` does not know Facebook exists. `platforms.ts` does not import React.

Two separate concerns, deliberately not merged: `platforms.ts` says **what a
platform is**, `matrix.ts` says **who sees it and in what order**. A single
registry carrying both a `locales` array and a `priority` number would give
ordering two sources of truth.

```
lib/share/
  types.ts        PlatformId, ShareTarget, ShareContext, ShareEnv, DeliveryMode
  platforms.ts    the registry — one object per platform (identity + behavior)
  matrix.ts       LOCALE_TARGETS: Record<Locale, PlatformId[]>, + UNIVERSAL_TAIL
  resolve.ts      pure: resolveTargets(locale, ctx, env) → ordered ShareTarget[]
  url.ts          pure: buildShareUrl() → canonical + optional UTM

hooks/
  useShare.ts     behavior: popup / native / clipboard / QR / GA4

components/share/
  ShareIcons.tsx      inline brand SVG (tree-shaken; lucide has no brand marks)
  ShareButton.tsx     atom — icon + label + click
  ShareRow.tsx        horizontal labeled row + More disclosure
  ShareRail.tsx       sticky vertical rail (desktop)
  ShareBar.tsx        composite — the only public export
  WeChatQrModal.tsx   dynamic-imported; never in the main bundle
```

### Registry entry shape

A platform's entire definition — identity and behavior, no audience logic:

```ts
{
  id: 'whatsapp',
  labelKey: 'share.whatsapp',
  icon: WhatsAppIcon,
  mode: 'popup',
  href: (ctx) => `https://wa.me/?text=${enc(`${ctx.title} ${ctx.url}`)}`,
  enabled: (ctx, env) => true,   // omit when unconditional
}
```

Audience and order live in `matrix.ts`, keyed by locale:

```ts
export const LOCALE_TARGETS: Record<Locale, PlatformId[]> = {
  ru: ['telegram', 'vk', 'whatsapp', 'viber', 'x', 'facebook'],
  // …
};
export const UNIVERSAL_TAIL: PlatformId[] = ['email', 'copy', 'native'];
```

**Adding a platform = one registry object + its id in the locale rows that want
it.** `resolve.ts` maps `matrix[locale]` through the registry, drops entries
whose `enabled` guard fails, appends the tail, and applies the visible cap.
Order is the array index — the matrix is the only thing that decides it.

### Delivery modes

Every button renders as a real `<a href>` with `rel="noopener nofollow"` — works
without JS, survives right/middle-click, leaks no link equity. The mode decides
only what the click handler adds:

| Mode | Behavior |
|---|---|
| `popup` | `window.open` 600×540; falls back to navigation if blocked |
| `navigate` | plain link, no interception (`mailto:`, deep links) |
| `copy` | Clipboard API; label → "Copied!" for 2s; hidden-textarea fallback on insecure contexts |
| `qr` | opens the lazy WeChat modal |
| `native` | `navigator.share()` — reaches Instagram, TikTok, Messages |

## Platform roster

| Platform | Mode | Guard |
|---|---|---|
| Facebook, X, LinkedIn, WhatsApp, Telegram, Reddit, Threads, Bluesky, Tumblr, VK, Weibo, LINE, Zalo, QQ/QZone | `popup` | — |
| Pinterest | `popup` | `ctx.imageUrl` required |
| Messenger (`fb-messenger://share`), Viber, SMS | `navigate` | mobile only |
| Email | `navigate` | — |
| WeChat | `qr` | — |
| Copy link | `copy` | always penultimate |
| Native sheet | `native` | mobile only, post-mount support check |

**Messenger** uses the deep link, not `facebook.com/dialog/send`, because the
latter requires a registered FB app id this site does not have.

## Locale matrix

Universal tail — Email, Copy link, Native — appended to every locale.

| Locale | Ordered targets |
|---|---|
| `en` | Facebook, X, LinkedIn, Pinterest, WhatsApp, Reddit, Threads, Bluesky, Messenger, Tumblr, SMS |
| `fr` | Facebook, X, LinkedIn, WhatsApp, Pinterest, Telegram, Threads, Messenger, SMS |
| `es` | WhatsApp, Facebook, X, Messenger, Telegram, Pinterest, Threads, SMS |
| `tl` | Facebook, Messenger, WhatsApp, X, Viber, Telegram, Pinterest, SMS |
| `zh` | WeChat, Weibo, QQ/QZone, X, Facebook, LINE |
| `zh-Hant` | WeChat, LINE, Facebook, X, Weibo, Threads, Telegram |
| `ja` | LINE, X, Facebook, Threads, Pinterest, Tumblr |
| `ko` | X, Facebook, LINE, Threads, Pinterest |
| `hi`, `pa` | WhatsApp, Facebook, Telegram, X, Messenger, Pinterest, SMS |
| `ar`, `fa` | WhatsApp, Telegram, Facebook, X, Viber, Pinterest, SMS |
| `ru` | Telegram, VK, WhatsApp, Viber, X, Facebook |
| `vi` | Facebook, Zalo, Messenger, Telegram, X, Viber, Pinterest |

## Rendering

`resolveTargets()` returns the **full** ordered list; the layouts decide what is
**visible**. Comprehensive underneath, restrained on screen.

- **Visible cap:** 8 desktop, 5 mobile. The remainder sits behind a **More**
  disclosure (`+N` chip on the row, ellipsis on the rail). The cap is a prop.
- **Desktop (`lg`+):** sticky rail beside the article **and** the labeled inline
  row at the end of the content. Both. The rail catches the impulse share, the
  row catches the finished-reading share.
- **Mobile:** inline row only, 5 visible, plus native sheet.
- The rail caps its height with internal scroll so it cannot overflow a short
  viewport.

## Data flow

The share URL is **derived from** the canonical, never rebuilt beside it, so the
two cannot drift when a routing rule changes. The server page already computes
its canonical for metadata; `Page()` calls the same helper:

```tsx
const url = buildAlternates(`/blog/${slug}`, locale).canonical;
<BlogPostPage ... share={{ url, title: post.title, imageUrl: post.hero_image_url }} />
```

Both `BlogPostPage.tsx` and `ProjectDetailPage.tsx` are already `'use client'`,
so `<ShareBar context={share} contentType="blog" />` needs no boundary work.

## Tracking

GA4's **recommended** `share` event — reserved name, so it populates built-in
engagement reports with no GA4-side configuration:

```ts
gtag('event', 'share', { method: 'facebook', content_type: 'blog', item_id: slug });
```

Guarded by `if (!window.gtag) return`, matching `GoogleAdsConversion.tsx`. No-op
in dev.

**UTM:** platform buttons get
`utm_source=<platform>&utm_medium=social&utm_campaign=share`. Copy link and the
native sheet hand back the **clean** canonical — that URL is one the visitor sees
and pastes.

> **Watch:** query params can form separate Cloudflare cache keys, so tagged
> inbound links may bypass the 300s HTML edge cache and hit origin. Verify
> against the Cache Rule during implementation. Fix, if needed, is an
> `ignore_query_strings` cache key — not dropping UTMs.

## i18n

`messages/<locale>/share.json` × 14, ~25 keys each. Brand names stay brand names
("Facebook"); surrounding labels translate. Per standing rule, `zh`/`zh-Hant` use
native names: 微信, 微博, 复制链接. EN and zh/zh-Hant hand-written; the other 11
generated in the same pass and flagged for spot-check.

## Edge cases

- **Hydration:** all capability checks (native sheet, mobile-only platforms) run
  post-mount. Deciding on the server would guarantee a mismatch. The native
  button mounts hidden and reveals in `useEffect` — one deliberate flash.
- **Popup blocked:** falls through to plain navigation.
- **Clipboard:** hidden-textarea + `execCommand` fallback on insecure contexts.
- **Encoding:** RTL (`ar`, `fa`) titles and emoji pass through
  `encodeURIComponent`; covered by snapshot tests.
- **A11y:** `aria-label` per button ("Share on Facebook"); More is a real
  `<button aria-expanded>`; QR modal traps focus, closes on Esc, respects
  `prefers-reduced-motion`.

## Testing

The pure core carries the weight.

| Target | Test |
|---|---|
| `resolve.ts` | Table-driven: each of 14 locales → expected ordered list; 8/5 caps; `imageUrl` and mobile-only guards |
| `url.ts` | UTM composition; encoding of RTL + emoji titles; clean URL for copy/native |
| `platforms.ts` | Snapshot every `href(ctx)` against one fixture — catches template-string encoding regressions |
| `ShareButton`, `ShareRow` | Render: correct `href`/`rel`; More toggles `aria-expanded` |
| e2e (Playwright) | Blog post: rail visible at desktop width; Copy writes canonical to clipboard; More reveals tail |

## Dependencies

- **`qrcode`** (new, ~20KB) — dynamic-imported inside `WeChatQrModal` only, so
  it never enters the main bundle.
- No `react-share`. It has no WeChat QR or Weibo, no locale logic, ships icons
  that clash with the design system, and would need wrapping anyway.

## Follow-ups

- KakaoTalk via Kakao JS SDK (needs app key + domain registration).
- Share bar on service / area pages (one-line change once this lands).
