import { describe, it, expect } from 'vitest';
import { resolveTargets, splitVisible } from '@/lib/share/resolve';
import { LOCALE_TARGETS, UNIVERSAL_TAIL, VISIBLE_CAP } from '@/lib/share/matrix';
import { PLATFORMS } from '@/lib/share/platforms';
import { locales } from '@/i18n/config';
import type { PlatformId, ShareContext, ShareEnv } from '@/lib/share/types';

// resolveTargets is the whole "dynamic" claim of the share bar: it decides who
// sees which platforms, in what order. It is pure, so it is pinned here without
// a DOM, and these tests are the only thing standing between a matrix edit and
// a zh reader losing WeChat.

const CTX: ShareContext = {
  url: 'https://www.reno-stars.com/en/blog/kitchen-costs/',
  title: 'Kitchen Renovation Costs',
  imageUrl: 'https://img.reno-stars.com/hero.webp',
};
const NO_IMAGE: ShareContext = { url: CTX.url, title: CTX.title };

const DESKTOP: ShareEnv = { isMobile: false, hasNativeShare: false };
const MOBILE: ShareEnv = { isMobile: true, hasNativeShare: true };

const ids = (env: ShareEnv, locale = 'en' as const, ctx = CTX) =>
  resolveTargets(locale, ctx, env).map((t) => t.id);

describe('resolveTargets — matrix coverage', () => {
  it.each(locales)('%s resolves to its matrix row plus the universal tail', (locale) => {
    // Mobile env so nothing is filtered by the mobile-only guard.
    const resolved = resolveTargets(locale, CTX, MOBILE).map((t) => t.id);
    expect(resolved).toEqual([...LOCALE_TARGETS[locale], ...UNIVERSAL_TAIL]);
  });

  it.each(locales)('%s references only platforms that exist in the registry', (locale) => {
    for (const id of LOCALE_TARGETS[locale]) {
      expect(PLATFORMS[id], `${locale} lists unknown platform "${id}"`).toBeDefined();
    }
  });

  it.each(locales)('%s lists no duplicates within its own row', (locale) => {
    const row = LOCALE_TARGETS[locale];
    expect(new Set(row).size).toBe(row.length);
  });

  it('gives zh WeChat first — the whole point of a locale-aware bar', () => {
    expect(ids(MOBILE, 'zh')[0]).toBe('wechat');
  });

  it('gives ru Telegram first, not Facebook', () => {
    expect(ids(MOBILE, 'ru')[0]).toBe('telegram');
  });

  it('never offers LinkedIn to zh readers', () => {
    expect(ids(MOBILE, 'zh')).not.toContain('linkedin');
  });

  it('falls back to the en row for an unknown locale', () => {
    // @ts-expect-error -- deliberately outside Locale, guarding the ?? branch.
    expect(resolveTargets('kl', CTX, MOBILE).map((t) => t.id))
      .toEqual([...LOCALE_TARGETS.en, ...UNIVERSAL_TAIL]);
  });

  it('does not duplicate a tail platform a locale row also lists', () => {
    // Nothing in the matrix does this today; the dedupe exists so that adding
    // e.g. 'email' to a row cannot silently render two Email buttons.
    const resolved = resolveTargets('en', CTX, MOBILE).map((t) => t.id);
    expect(new Set(resolved).size).toBe(resolved.length);
  });
});

describe('resolveTargets — guards', () => {
  it('drops Pinterest when the page has no image (a pin with no image is dead)', () => {
    expect(ids(MOBILE, 'en', CTX)).toContain('pinterest');
    expect(ids(MOBILE, 'en', NO_IMAGE)).not.toContain('pinterest');
  });

  it('hides app-deep-link platforms on desktop where they would no-op', () => {
    const desktop = ids(DESKTOP);
    expect(desktop).not.toContain('messenger');
    expect(desktop).not.toContain('sms');
    expect(ids(MOBILE)).toContain('messenger');
  });

  it('hides Viber on desktop for ru', () => {
    expect(ids(DESKTOP, 'ru')).not.toContain('viber');
    expect(ids(MOBILE, 'ru')).toContain('viber');
  });

  it('shows the native sheet only where navigator.share exists', () => {
    expect(ids({ isMobile: true, hasNativeShare: false })).not.toContain('native');
    expect(ids({ isMobile: true, hasNativeShare: true })).toContain('native');
  });

  it('always offers Copy link — the one target that cannot fail', () => {
    for (const locale of locales) {
      expect(resolveTargets(locale, NO_IMAGE, DESKTOP).map((t) => t.id)).toContain('copy');
    }
  });
});

describe('splitVisible', () => {
  it('caps the desktop row at 8', () => {
    const targets = resolveTargets('en', CTX, DESKTOP);
    const { visible, overflow } = splitVisible(targets, DESKTOP);
    expect(visible).toHaveLength(VISIBLE_CAP.desktop);
    expect(overflow.length).toBeGreaterThan(0);
    expect(visible.length + overflow.length).toBe(targets.length);
  });

  it('caps the mobile row at 5', () => {
    const targets = resolveTargets('en', CTX, MOBILE);
    const { visible } = splitVisible(targets, MOBILE);
    expect(visible).toHaveLength(VISIBLE_CAP.mobile);
  });

  it('preserves matrix order in the visible slice', () => {
    const targets = resolveTargets('zh', CTX, DESKTOP);
    const { visible } = splitVisible(targets, DESKTOP);
    expect(visible.map((t) => t.id).slice(0, 3)).toEqual(['wechat', 'weibo', 'qzone']);
  });

  // The cap boundary is tested against synthetic lists, not the live matrix:
  // whether any real locale happens to resolve to exactly cap+1 today is an
  // accident of the matrix, and coupling the boundary to it would make an
  // unrelated matrix edit fail this test for the wrong reason.
  const fakeTargets = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ ...PLATFORMS.facebook, id: `fake-${i}` as PlatformId }));

  it('renders a lone overflow item rather than hiding it behind "+1 more"', () => {
    // A "+1 more" control costs the same room as the button it conceals.
    const { visible, overflow } = splitVisible(fakeTargets(VISIBLE_CAP.desktop + 1), DESKTOP);
    expect(overflow).toHaveLength(0);
    expect(visible).toHaveLength(VISIBLE_CAP.desktop + 1);
  });

  it('discloses overflow once there are at least two to hide', () => {
    const { visible, overflow } = splitVisible(fakeTargets(VISIBLE_CAP.desktop + 2), DESKTOP);
    expect(visible).toHaveLength(VISIBLE_CAP.desktop);
    expect(overflow).toHaveLength(2);
  });

  it('leaves a short list entirely visible', () => {
    const { visible, overflow } = splitVisible(fakeTargets(3), MOBILE);
    expect(visible).toHaveLength(3);
    expect(overflow).toHaveLength(0);
  });

  it('never loses a target between visible and overflow', () => {
    for (const locale of locales) {
      const targets = resolveTargets(locale, CTX, MOBILE);
      const { visible, overflow } = splitVisible(targets, MOBILE);
      expect([...visible, ...overflow].map((t) => t.id)).toEqual(targets.map((t) => t.id));
    }
  });
});
