import { describe, it, expect } from 'vitest';
import { GOLD, GOLD_ICON_FILTER } from '@/lib/theme';
import { simulateFilterChain, deltaE, hexToRgb, rgbToHex } from '@/lib/css-filter-sim';

// Guards GOLD_ICON_FILTER against drifting from GOLD: the filter tints black
// SVG <img> icons (ServicesSection, ServiceDetailPage, ServicesPage, admin
// services list), so if GOLD changes without regenerating the filter, icons
// visibly mismatch the gold text next to them. This test FAILS in that case —
// run `pnpm tsx scripts/generate-gold-icon-filter.ts` and paste the printed
// chain into lib/theme.ts to fix.
describe('GOLD_ICON_FILTER', () => {
  it('tints a black icon to within deltaE < 6 of GOLD', () => {
    const achieved = simulateFilterChain(GOLD_ICON_FILTER);
    const target = hexToRgb(GOLD);
    const d = deltaE(achieved, target);
    // Message surfaces the actual colors when the guard trips.
    expect(d, `filter produces ${rgbToHex(achieved)} but GOLD is ${GOLD}`).toBeLessThan(6);
  });
});

// Sanity checks that the simulation itself matches the CSS filter spec, so a
// regression in css-filter-sim.ts can't silently loosen the guard above.
describe('simulateFilterChain', () => {
  it('invert(100%) turns black into white', () => {
    expect(simulateFilterChain('invert(100%)')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('identity chain leaves black untouched', () => {
    expect(
      simulateFilterChain('invert(0%) sepia(0%) saturate(100%) hue-rotate(0deg) brightness(100%) contrast(100%)'),
    ).toEqual({ r: 0, g: 0, b: 0 });
  });
  it('invert(50%) then brightness scales the resulting gray', () => {
    // invert(50%) -> 127.5 gray; brightness(200%) doubles then clamps to 255.
    expect(simulateFilterChain('invert(50%) brightness(200%)')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('deltaE is 0 for identical colors and large for black vs white', () => {
    const gold = hexToRgb(GOLD);
    expect(deltaE(gold, gold)).toBe(0);
    expect(deltaE({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeGreaterThan(90);
  });
});
