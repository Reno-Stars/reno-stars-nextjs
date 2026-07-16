// Simulates how a chain of CSS filter functions transforms a color, using the
// same math browsers apply (SVG/CSS filter-effects spec matrices on sRGB
// 0-255 channels, clamped after each step) — the approach popularized by
// Barrett Sonntag's hex-to-CSS-filter solver. This is the SSOT for
// GOLD_ICON_FILTER in lib/theme.ts: scripts/generate-gold-icon-filter.ts
// searches with it and tests/unit/lib/gold-icon-filter.test.ts verifies with
// it. Dependency-free by design.

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface FilterOp {
  /** Filter function name, e.g. 'invert' or 'hue-rotate'. */
  name: string;
  /** Normalized amount: fraction for %-based filters, degrees for hue-rotate. */
  amount: number;
}

const clampChannel = (v: number): number => Math.min(255, Math.max(0, v));

const clampRgb = ({ r, g, b }: Rgb): Rgb => ({
  r: clampChannel(r),
  g: clampChannel(g),
  b: clampChannel(b),
});

/** Parse '#RGB' or '#RRGGBB' (leading '#' optional) into 0-255 channels. */
export function hexToRgb(hex: string): Rgb {
  const h = hex.replace(/^#/, '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Format 0-255 channels (rounded) as '#rrggbb'. */
export function rgbToHex({ r, g, b }: Rgb): string {
  const to2 = (v: number) => Math.round(clampChannel(v)).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

// Row-major 3x3 color matrix multiply (filter-effects spec matrices).
const multiplyMatrix = ({ r, g, b }: Rgb, m: number[]): Rgb => ({
  r: r * m[0] + g * m[1] + b * m[2],
  g: r * m[3] + g * m[4] + b * m[5],
  b: r * m[6] + g * m[7] + b * m[8],
});

// invert(v): per-channel interpolation between the color and its inverse.
const invert = ({ r, g, b }: Rgb, v: number): Rgb => {
  const inv = (c: number) => (v + (c / 255) * (1 - 2 * v)) * 255;
  return { r: inv(r), g: inv(g), b: inv(b) };
};

// sepia(v): spec matrix interpolated toward identity as v -> 0.
const sepia = (rgb: Rgb, v: number): Rgb =>
  multiplyMatrix(rgb, [
    0.393 + 0.607 * (1 - v), 0.769 - 0.769 * (1 - v), 0.189 - 0.189 * (1 - v),
    0.349 - 0.349 * (1 - v), 0.686 + 0.314 * (1 - v), 0.168 - 0.168 * (1 - v),
    0.272 - 0.272 * (1 - v), 0.534 - 0.534 * (1 - v), 0.131 + 0.869 * (1 - v),
  ]);

// saturate(v): spec matrix built from Rec. 709 luma coefficients.
const saturate = (rgb: Rgb, v: number): Rgb =>
  multiplyMatrix(rgb, [
    0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v,
    0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v,
    0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v,
  ]);

// hue-rotate(deg): spec matrix parameterized by cos/sin of the angle.
const hueRotate = (rgb: Rgb, deg: number): Rgb => {
  const a = (deg / 180) * Math.PI;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return multiplyMatrix(rgb, [
    0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928,
    0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.140, 0.072 - cos * 0.072 - sin * 0.283,
    0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072,
  ]);
};

// brightness(v): linear per-channel scale.
const brightness = ({ r, g, b }: Rgb, v: number): Rgb => ({ r: r * v, g: g * v, b: b * v });

// contrast(v): linear per-channel with slope v and intercept 0.5 - v/2.
const contrast = ({ r, g, b }: Rgb, v: number): Rgb => {
  const con = (c: number) => c * v + (-0.5 * v + 0.5) * 255;
  return { r: con(r), g: con(g), b: con(b) };
};

/** Apply a single already-parsed filter op (clamping the result to 0-255). */
export function applyFilterOp(rgb: Rgb, op: FilterOp): Rgb {
  switch (op.name) {
    case 'invert': return clampRgb(invert(rgb, op.amount));
    case 'sepia': return clampRgb(sepia(rgb, op.amount));
    case 'saturate': return clampRgb(saturate(rgb, op.amount));
    case 'hue-rotate': return clampRgb(hueRotate(rgb, op.amount));
    case 'brightness': return clampRgb(brightness(rgb, op.amount));
    case 'contrast': return clampRgb(contrast(rgb, op.amount));
    default: throw new Error(`Unsupported filter function: ${op.name}`);
  }
}

/** Apply a parsed chain in order, clamping 0-255 after each step. */
export const applyFilterChain = (ops: FilterOp[], start: Rgb): Rgb =>
  ops.reduce(applyFilterOp, start);

/**
 * Parse a CSS filter string like
 * 'invert(56%) sepia(72%) saturate(467%) hue-rotate(6deg) brightness(90%)'.
 * Percentages and unitless numbers normalize to fractions (56% -> 0.56);
 * hue-rotate amounts are kept in degrees.
 */
export function parseFilterChain(filter: string): FilterOp[] {
  const ops: FilterOp[] = [];
  const re = /([a-z-]+)\(\s*(-?[\d.]+)(%|deg)?\s*\)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(filter)) !== null) {
    const name = match[1].toLowerCase();
    const value = parseFloat(match[2]);
    const unit = match[3] ?? '';
    const amount = name === 'hue-rotate' ? value : unit === '%' ? value / 100 : value;
    ops.push({ name, amount });
  }
  if (ops.length === 0) throw new Error(`No filter functions found in: ${filter}`);
  return ops;
}

/** Simulate a CSS filter string applied to black (#000) — how <img> SVG icon tinting starts. */
export function simulateFilterChain(filter: string): Rgb {
  const { r, g, b } = applyFilterChain(parseFilterChain(filter), { r: 0, g: 0, b: 0 });
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// sRGB -> CIE Lab (D65), for perceptual color difference.
function rgbToLab({ r, g, b }: Rgb): [number, number, number] {
  const lin = (c: number) => {
    const s = c / 255;
    return s > 0.04045 ? Math.pow((s + 0.055) / 1.055, 2.4) : s / 12.92;
  };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  // D65-normalized XYZ.
  const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** CIE76 color difference (Euclidean distance in Lab). < ~2 is imperceptible. */
export function deltaE(rgb1: Rgb, rgb2: Rgb): number {
  const [l1, a1, b1] = rgbToLab(rgb1);
  const [l2, a2, b2] = rgbToLab(rgb2);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}
