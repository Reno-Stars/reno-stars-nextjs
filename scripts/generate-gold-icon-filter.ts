/**
 * Regenerate GOLD_ICON_FILTER for lib/theme.ts.
 *
 * Finds a CSS filter chain
 *   invert(..%) sepia(..%) saturate(..%) hue-rotate(..deg) brightness(..%) contrast(..%)
 * that tints a black SVG <img> to the current theme GOLD, by minimizing the
 * perceptual color difference (CIE76 deltaE) with an SPSA + random-restart
 * search — the same approach as Barrett Sonntag's hex-to-CSS-filter codepen.
 *
 * SSOT: the search evaluates candidates with lib/css-filter-sim.ts, the exact
 * simulation tests/unit/lib/gold-icon-filter.test.ts uses to guard the value,
 * and the target is imported from lib/theme.ts GOLD.
 *
 * Usage: pnpm tsx scripts/generate-gold-icon-filter.ts
 * Paste the printed filter into GOLD_ICON_FILTER in lib/theme.ts.
 */
import { GOLD } from '@/lib/theme';
import {
  applyFilterChain,
  deltaE,
  hexToRgb,
  rgbToHex,
  simulateFilterChain,
  type FilterOp,
  type Rgb,
} from '@/lib/css-filter-sim';

// Params: [invert%, sepia%, saturate%, hueRotate (x3.6 deg), brightness%, contrast%].
// Hue is stored on a 0-100 scale (like the codepen) so all six share step sizes.
type Params = [number, number, number, number, number, number];

const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const TARGET = hexToRgb(GOLD);

const toOps = (p: Params): FilterOp[] => [
  { name: 'invert', amount: p[0] / 100 },
  { name: 'sepia', amount: p[1] / 100 },
  { name: 'saturate', amount: p[2] / 100 },
  { name: 'hue-rotate', amount: p[3] * 3.6 },
  { name: 'brightness', amount: p[4] / 100 },
  { name: 'contrast', amount: p[5] / 100 },
];

const toFilterString = (p: Params): string =>
  `invert(${Math.round(p[0])}%) sepia(${Math.round(p[1])}%) ` +
  `saturate(${Math.round(p[2])}%) hue-rotate(${Math.round(p[3] * 3.6)}deg) ` +
  `brightness(${Math.round(p[4])}%) contrast(${Math.round(p[5])}%)`;

const loss = (p: Params): number => deltaE(applyFilterChain(toOps(p), BLACK), TARGET);

// Per-param clamping: saturate may exceed 100%, brightness/contrast up to 200%,
// hue wraps modulo 360deg (100 on the stored scale), the rest stay 0-100%.
function fix(value: number, idx: number): number {
  if (idx === 3) return ((value % 100) + 100) % 100;
  const max = idx === 2 ? 7500 : idx === 4 || idx === 5 ? 200 : 100;
  return Math.min(max, Math.max(0, value));
}

// Simultaneous Perturbation Stochastic Approximation: estimates the gradient
// from two evaluations per iteration under a random +/-1 perturbation.
function spsa(A: number, a: number[], c: number, start: Params, iters: number): { params: Params; loss: number } {
  const alpha = 1;
  const gamma = 1 / 6;
  const values = start.slice() as Params;
  let best = start.slice() as Params;
  let bestLoss = loss(start);
  for (let k = 0; k < iters; k++) {
    const ck = c / Math.pow(k + 1, gamma);
    const deltas = values.map(() => (Math.random() > 0.5 ? 1 : -1));
    const high = values.map((v, i) => v + ck * deltas[i]) as Params;
    const low = values.map((v, i) => v - ck * deltas[i]) as Params;
    const lossDiff = loss(high) - loss(low);
    for (let i = 0; i < values.length; i++) {
      const g = (lossDiff / (2 * ck)) * deltas[i];
      const ak = a[i] / Math.pow(A + k + 1, alpha);
      values[i] = fix(values[i] - ak * g, i);
    }
    const l = loss(values);
    if (l < bestLoss) {
      best = values.slice() as Params;
      bestLoss = l;
    }
  }
  return { params: best, loss: bestLoss };
}

// One restart: a wide exploratory pass from a random start, then a narrow
// refinement pass whose step sizes shrink with the loss already achieved.
function solve(): { params: Params; loss: number } {
  const start: Params = [
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 4000,
    Math.random() * 100,
    40 + Math.random() * 160,
    40 + Math.random() * 160,
  ];
  const wide = spsa(5, [60, 180, 18000, 600, 1.2, 1.2], 15, start, 1000);
  const A = wide.loss + 1;
  return spsa(wide.loss, [0.25 * A, 0.25 * A, A, 0.25 * A, 0.2 * A, 0.2 * A], 2, wide.params, 500);
}

function main(): void {
  const restarts = 40;
  let bestFilter = '';
  let bestDeltaE = Infinity;
  for (let i = 0; i < restarts && bestDeltaE >= 0.5; i++) {
    const candidate = solve();
    // Score the ROUNDED filter string via the string-parsing simulation — the
    // exact code path the guard test runs against theme.ts.
    const filter = toFilterString(candidate.params);
    const achieved = simulateFilterChain(filter);
    const d = deltaE(achieved, TARGET);
    if (d < bestDeltaE) {
      bestDeltaE = d;
      bestFilter = filter;
    }
  }
  const achieved = simulateFilterChain(bestFilter);
  console.log(`target   GOLD ${GOLD} (from lib/theme.ts)`);
  console.log(`filter   ${bestFilter}`);
  console.log(`achieved ${rgbToHex(achieved)} rgb(${achieved.r}, ${achieved.g}, ${achieved.b})`);
  console.log(`deltaE   ${bestDeltaE.toFixed(3)}`);
  if (bestDeltaE >= 4) {
    console.error('deltaE >= 4 — re-run for a better result before updating lib/theme.ts');
    process.exit(1);
  }
}

main();
