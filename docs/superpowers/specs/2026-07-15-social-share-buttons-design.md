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

### Cloudflare cache-key impact — measured 2026-07-15, no action needed

The concern was that UTM-tagged inbound links would form separate edge cache
keys and hammer origin. Measured against production rather than assumed:

| Request | cf-cache-status |
|---|---|
| clean URL | HIT |
| `?utm_source=facebook&utm_medium=social&utm_campaign=share` | MISS once, then HIT |
| `?utm_source=<random>` | MISS |
| `?utm_source=facebook…&fbclid=<random>` ×4, each fbclid unique | MISS once, then **HIT, HIT, HIT** |
| `?gclid=<random>` | MISS |

Two findings:

1. **UTMs fragment the key, but boundedly.** `utm_source` is one of ~22 fixed
   platform ids, so a shared page has at most ~22 variants, each caching
   normally. At `s-maxage=300` they churn every 5 minutes regardless.
2. **`fbclid` is already ignored in the cache key** — the high-volume random
   param, present on every Facebook referral, does NOT fragment. That was the
   only case with real thundering-herd potential.

Conclusion: no `ignore_query_strings` cache-key change is warranted. Revisit
only if origin load rises with social traffic. (`gclid` does fragment, but that
is pre-existing paid-ads behaviour, unrelated to sharing.)

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

- **`qrcode`** (new, ~20KB) + `@types/qrcode` — dynamic-imported inside
  `WeChatQrModal` only, so it never enters the main bundle. The ONLY runtime
  dependency this feature adds.
- No `react-share`. It has no WeChat QR or Weibo, no locale logic, ships icons
  that clash with the design system, and would need wrapping anyway.

### Icons are vendored, not depended on

`components/share/ShareIcons.tsx` is generated, holding real path data copied in
at author time:

- **17 brand marks** from `simple-icons` v16.26.0 (paths are CC0-1.0).
  Vendored rather than imported: the package ships 3,449 icons in one ESM
  module, and while it declares `sideEffects: false`, vendoring means a
  tree-shaking regression can never drag them into the bundle.
- **LinkedIn** from `bootstrap-icons` v1.13.1 (MIT) — simple-icons removed
  LinkedIn on trademark request. `lucide-react`'s `Linkedin` was tried first and
  rejected: it is a stroked outline glyph, and at 10x zoom it read as a visibly
  different icon family beside the filled brand marks. NOTE its viewBox is
  16x16, not 24x24.
- **Non-brand marks** (Email, Copy, Share, SMS, QR, Check) from `lucide-react`,
  already a project dependency.

Both icon packages were installed, extracted from, and removed. Neither appears
in `package.json`.

> The X mark renders as a thin, hollow X rather than a solid one. This was
> checked against `simple-icons`' own `x.svg` rendered untouched in Chrome — the
> path is byte-identical and the render is pixel-identical. It is the canonical
> asset, not a defect.

## Verified

Checked on a real dev render (port 3010; prod untouched on :3000) against
`/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026/`:

- Share row + rail server-render with real `<a href>`s — works with JS disabled.
- Locale-aware resolution is real: zh → 微信/微博/QQ空间, ru → Telegram/VK,
  ja → LINE first.
- Rail hidden at 1279px, visible at 1280px with 164px of clearance from the
  article; self-limits to 400px tall on a 500px viewport.
- Mobile (390px): rail absent, exactly 5 buttons + "+9 more".
- WeChat QR **decoded with a real decoder** → resolves to the zh canonical with
  `utm_source=wechat`. Esc closes the modal.
- Copy link writes the **clean** canonical to the clipboard — no UTM.
- 93 new unit tests; full suite 868 passing; 0 type errors; 0 lint errors.

**Not verified: `pnpm build`.** Production `next start` runs out of this very
directory (launchd `com.renostars.reno-stars-web`), so building here would swap
`.next` out from under the live site. The production build must happen through
the normal deploy flow, on merged code.

## Follow-ups

- KakaoTalk via Kakao JS SDK (needs app key + domain registration).
- Share bar on service / area pages (one-line change once this lands).
- Spot-check the 11 machine-generated locale label files (en + zh + zh-Hant were
  hand-written).
