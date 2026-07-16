import { describe, it, expect } from 'vitest';
import { buildDisplayVariant, buildOptimizedUrl, DEFAULT_QUALITY } from '@/lib/image';

// Allowlisted R2 host (see ALLOWED_IMAGE_HOSTS in lib/image.ts)
const R2_HOST = 'pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev';
const R2_JPG = `https://${R2_HOST}/reno-stars/uploads/admin/partner-logo.jpg`;
const R2_SVG = `https://${R2_HOST}/reno-stars/uploads/admin/partner-logo.svg`;
const R2_SVG_UPPER = `https://${R2_HOST}/reno-stars/uploads/admin/PARTNER-LOGO.SVG`;

describe('buildDisplayVariant', () => {
  it('routes an allowlisted-host jpg through /api/image with src, srcSet and sizes', () => {
    const v = buildDisplayVariant(R2_JPG, { widths: [128, 256], sizes: '128px', quality: 75 });
    expect(v.src).toBe(buildOptimizedUrl(R2_JPG, 256, 75));
    expect(v.src).toContain('/api/image/?');
    expect(v.src).toContain('w=256');
    expect(v.src).toContain('q=75');
    expect(v.srcSet).toBe(
      `${buildOptimizedUrl(R2_JPG, 128, 75)} 128w, ${buildOptimizedUrl(R2_JPG, 256, 75)} 256w`
    );
    expect(v.sizes).toBe('128px');
  });

  it('returns an allowlisted .svg raw when svgPassthrough is set', () => {
    const v = buildDisplayVariant(R2_SVG, { widths: [128, 256], sizes: '128px', svgPassthrough: true });
    expect(v).toEqual({ src: R2_SVG });
  });

  it('svgPassthrough matches uppercase .SVG extensions too', () => {
    const v = buildDisplayVariant(R2_SVG_UPPER, { widths: [128, 256], sizes: '128px', svgPassthrough: true });
    expect(v).toEqual({ src: R2_SVG_UPPER });
  });

  it('optimizes an .svg when svgPassthrough is NOT set (avatar behavior)', () => {
    const v = buildDisplayVariant(R2_SVG, { widths: [72, 108], sizes: '36px', quality: 65 });
    expect(v.src).toBe(buildOptimizedUrl(R2_SVG, 108, 65));
    expect(v.srcSet).toBeDefined();
  });

  it('returns a non-allowlisted host raw', () => {
    const external = 'https://cdn.example.com/logo.png';
    const v = buildDisplayVariant(external, { widths: [128, 256], sizes: '128px' });
    expect(v).toEqual({ src: external });
  });

  it('returns a malformed URL raw', () => {
    const v = buildDisplayVariant('not-a-url', { widths: [128, 256], sizes: '128px' });
    expect(v).toEqual({ src: 'not-a-url' });
  });

  it('applies DEFAULT_QUALITY when quality is omitted', () => {
    const v = buildDisplayVariant(R2_JPG, { widths: [72, 108], sizes: '36px' });
    expect(v.src).toBe(buildOptimizedUrl(R2_JPG, 108, DEFAULT_QUALITY));
    expect(v.src).toContain(`q=${DEFAULT_QUALITY}`);
    expect(v.srcSet).toContain(`${buildOptimizedUrl(R2_JPG, 72, DEFAULT_QUALITY)} 72w`);
  });
});
