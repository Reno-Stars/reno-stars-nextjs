/**
 * WCAG-AA contrast regression guard for the lib/theme color token system.
 *
 * The site reached Lighthouse Accessibility 100 (2026-07-16) via a two-token
 * gold system: GOLD is the foreground gold on light surfaces (and the button
 * background under white text), GOLD_ON_DARK is the gold used on NAVY dark
 * sections. Every token pairing the codebase actually renders is asserted
 * here at >= 4.5:1 (WCAG 2.x AA, normal text).
 *
 * If a token change makes this test fail, fix the token (or its usage) —
 * do NOT relax the thresholds in this file.
 */
import { describe, it, expect } from 'vitest';
import {
  NAVY,
  GOLD,
  GOLD_ON_DARK,
  SURFACE,
  SURFACE_LIGHT,
  SURFACE_DARK,
  SURFACE_ALT,
  CARD,
  TEXT,
  TEXT_MID,
  TEXT_MUTED,
} from '@/lib/theme';

const AA_NORMAL = 4.5;

/** Parse '#rgb' or '#rrggbb' into 0-255 channels. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (full.length !== 6 || /[^0-9a-f]/i.test(full)) {
    throw new Error(`Not a hex color: ${hex}`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Parse 'rgba(r,g,b,a)' into channels + alpha. */
function parseRgba(rgba: string): { rgb: [number, number, number]; alpha: number } {
  const m = rgba.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (!m) throw new Error(`Not an rgb(a) color: ${rgba}`);
  return {
    rgb: [Number(m[1]), Number(m[2]), Number(m[3])],
    alpha: m[4] === undefined ? 1 : Number(m[4]),
  };
}

/**
 * Composite a semi-transparent foreground over an opaque hex background:
 * out = a*fg + (1-a)*bg per channel, in 0-255 sRGB space (matches how the
 * browser blends rgba text over the surface before rasterizing).
 */
function compositeOver(rgbaFg: string, hexBg: string): [number, number, number] {
  const { rgb: fg, alpha } = parseRgba(rgbaFg);
  const bg = hexToRgb(hexBg);
  return [
    alpha * fg[0] + (1 - alpha) * bg[0],
    alpha * fg[1] + (1 - alpha) * bg[1],
    alpha * fg[2] + (1 - alpha) * bg[2],
  ] as [number, number, number];
}

/** WCAG 2.x relative luminance of 0-255 sRGB channels. */
function luminance([r, g, b]: [number, number, number]): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** WCAG 2.x contrast ratio between two colors (order-independent). */
function contrast(a: [number, number, number], b: [number, number, number]): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function hexContrast(fgHex: string, bgHex: string): number {
  return contrast(hexToRgb(fgHex), hexToRgb(bgHex));
}

const surfaces: [name: string, hex: string][] = [
  ['SURFACE', SURFACE],
  ['SURFACE_LIGHT', SURFACE_LIGHT],
  ['SURFACE_DARK', SURFACE_DARK],
  ['SURFACE_ALT', SURFACE_ALT],
  ['CARD', CARD],
];

describe('theme token WCAG-AA contrast (>= 4.5:1)', () => {
  describe('GOLD as text/link on light surfaces', () => {
    it.each([...surfaces, ['white', '#ffffff'] as [string, string]])(
      'GOLD on %s',
      (_name, bg) => {
        const ratio = hexContrast(GOLD, bg);
        expect(ratio, `GOLD on ${_name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
      },
    );
  });

  it('white text on GOLD background (primary CTA buttons)', () => {
    const ratio = hexContrast('#ffffff', GOLD);
    expect(ratio, `white on GOLD = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('GOLD_ON_DARK as text/icon on NAVY dark sections', () => {
    const ratio = hexContrast(GOLD_ON_DARK, NAVY);
    expect(ratio, `GOLD_ON_DARK on NAVY = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('NAVY text on GOLD_ON_DARK background (careers/reviews hero buttons)', () => {
    const ratio = hexContrast(NAVY, GOLD_ON_DARK);
    expect(ratio, `NAVY on GOLD_ON_DARK = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  describe('TEXT on light surfaces', () => {
    it.each(surfaces)('TEXT on %s', (_name, bg) => {
      const ratio = hexContrast(TEXT, bg);
      expect(ratio, `TEXT on ${_name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  });

  describe('TEXT_MID (rgba) composited over light surfaces', () => {
    it.each(surfaces)('TEXT_MID over %s', (_name, bg) => {
      const ratio = contrast(compositeOver(TEXT_MID, bg), hexToRgb(bg));
      expect(ratio, `TEXT_MID over ${_name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  });

  describe('TEXT_MUTED (rgba) composited over light surfaces', () => {
    it.each(surfaces)('TEXT_MUTED over %s', (_name, bg) => {
      const ratio = contrast(compositeOver(TEXT_MUTED, bg), hexToRgb(bg));
      expect(ratio, `TEXT_MUTED over ${_name} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  });
});
