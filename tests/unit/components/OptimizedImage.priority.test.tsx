import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

import OptimizedImage from '@/components/OptimizedImage';
import HeroSection from '@/components/home/HeroSection';
import { buildProcessedSrcSet, buildProcessedUrl } from '@/lib/image';
import type { Company } from '@/lib/types';

// PageSpeed mobile (2026-09-24): /en/services/bathroom/ LCP 5.8s. The hero
// OptimizedImage was `priority`, yet the server HTML carried only a 20px
// blurred thumb (at fetchpriority=high); the real image mounted after
// hydration at opacity:0. These tests pin what a crawler / the preload scanner
// sees in the SERVER markup, which is what decides LCP.

const R2_SRC = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/bath.jpg';
const LEGACY_SRC = 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg';

// react-dom/server keeps some attribute names camelCased (`fetchPriority`,
// `srcSet`); HTML attribute names are case-insensitive, so normalise them.
const imgTags = (html: string) =>
  (html.match(/<img\b[^>]*>/g) ?? []).map((tag) =>
    tag.replace(/\s([A-Za-z-]+)=/g, (m) => m.toLowerCase()));

describe('OptimizedImage priority — full image in server HTML', () => {
  it.each([['R2', R2_SRC], ['legacy', LEGACY_SRC]])(
    'renders ONE visible <img> with fetchpriority=high (%s source)',
    (_label, src) => {
      const html = renderToStaticMarkup(
        <OptimizedImage src={src} alt="Hero alt" fill priority sizes="100vw" className="object-cover" />,
      );
      const imgs = imgTags(html);
      expect(imgs).toHaveLength(1); // no competing blur thumb
      const [img] = imgs;
      expect(img).toContain('fetchpriority="high"');
      expect(img).toContain('loading="eager"');
      expect(img).toContain('decoding="async"');
      expect(img).toMatch(/srcset="[^"]+ 1200w"/);
      expect(img).toContain('sizes="100vw"');
      expect(img).toContain('alt="Hero alt"');
      expect(img).not.toContain('aria-hidden');
      expect(img).not.toMatch(/opacity:\s*0/);
      expect(img).not.toContain('blur(');
      expect(html).not.toContain('shimmer'); // no overlay painted over the hero
    },
  );

  it('points R2 heroes at the processed 828w variant', () => {
    const html = renderToStaticMarkup(<OptimizedImage src={R2_SRC} alt="a" fill priority />);
    expect(imgTags(html)[0]).toContain(`src="${buildProcessedUrl(R2_SRC, 828)}"`);
  });

  it('keeps a caller-requested aria-hidden decorative', () => {
    const html = renderToStaticMarkup(<OptimizedImage src={R2_SRC} alt="a" fill priority aria-hidden />);
    const [img] = imgTags(html);
    expect(img).toContain('alt=""');
    expect(img).toContain('aria-hidden="true"');
  });
});

describe('OptimizedImage non-priority — LQIP behaviour unchanged', () => {
  it('server HTML has only the lazy blurred thumb, carrying the alt', () => {
    const html = renderToStaticMarkup(<OptimizedImage src={R2_SRC} alt="Gallery alt" fill sizes="50vw" />);
    const imgs = imgTags(html);
    expect(imgs).toHaveLength(1);
    const [thumb] = imgs;
    expect(thumb).toContain(`src="${buildProcessedUrl(R2_SRC, 320)}"`);
    expect(thumb).toContain('loading="lazy"');
    expect(thumb).toContain('blur(20px)');
    expect(thumb).toContain('alt="Gallery alt"');
    expect(thumb).not.toContain('srcset');
    expect(html.toLowerCase()).not.toContain('fetchpriority="high"');
    expect(html).toContain('shimmer');
  });
});

// React 19 hoists a <link rel="preload" as="image"> into <head> for every
// eagerly-loaded <img> it server-renders inside a full document. That is the
// ONLY image preload the site should emit: it is derived from the element the
// page actually renders, so it cannot point at an image the page never shows.
const renderDocument = (body: React.ReactNode) =>
  renderToString(<html><head /><body>{body}</body></html>);
const headPreloads = (html: string) => {
  const head = html.slice(0, html.indexOf('</head>'));
  return (head.match(/<link\b[^>]*rel="preload"[^>]*>/g) ?? []).map((tag) =>
    tag.replace(/\s([A-Za-z-]+)=/g, (m) => m.toLowerCase()));
};

describe('hero image preloads', () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

  it('a priority OptimizedImage gets ONE high-priority <head> preload of its own srcset', () => {
    const html = renderDocument(<OptimizedImage src={R2_SRC} alt="a" fill priority sizes="100vw" />);
    const preloads = headPreloads(html);
    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toContain('fetchpriority="high"');
    expect(preloads[0]).toContain(`imagesrcset="${buildProcessedSrcSet(R2_SRC)}"`);
    expect(preloads[0]).toContain('imagesizes="100vw"');
  });

  it('a non-priority OptimizedImage is not preloaded', () => {
    expect(headPreloads(renderDocument(<OptimizedImage src={R2_SRC} alt="a" fill />))).toHaveLength(0);
  });

  it('HeroSection (homepage) gets its poster preloaded from the rendered <img>', () => {
    const company = { heroImageUrl: R2_SRC, heroVideoUrl: '' } as unknown as Company;
    const html = renderDocument(
      <HeroSection
        company={company}
        translations={{
          transformYourSpace: 't', professionalExcellenceDesc: 'd', getFreeQuote: 'q', callNow: 'c',
          yearsExperience: 'y', liabilityCoverage: 'l', wcbCoverage: 'w', rating: 'r',
          realEstateTitle: 'rt', realEstateDesc: 'rd',
        }}
      />,
    );
    const hero = headPreloads(html).filter((t) => t.includes('fetchpriority="high"'));
    expect(hero).toHaveLength(1);
    expect(hero[0]).toContain(`imagesrcset="${buildProcessedSrcSet(R2_SRC)}"`);
  });

  it('the locale layout (wraps EVERY page) hand-writes no image preload', () => {
    const layout = read('app/[locale]/layout.tsx');
    expect(layout).not.toMatch(/rel="preload"/);
    expect(layout).not.toMatch(/images\.hero/);
  });

  it('the service page hand-writes no image preload (it used to preload unrendered OG fallbacks)', () => {
    expect(read('app/[locale]/services/[service-slug]/page.tsx')).not.toMatch(/rel="preload"/);
  });
});
