import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for redirect rules defined in next.config.ts
 *
 * These tests validate that the redirect rules are correctly structured
 * by calling the redirects() function from the Next.js config.
 * We mock the next-intl plugin to avoid its side effects.
 */

// Mock next-intl plugin (returns config unchanged)
vi.mock('next-intl/plugin', () => ({
  default: () => (config: unknown) => config,
}));

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

async function loadRedirects(): Promise<Redirect[]> {
  vi.resetModules();
  const configModule = await import('@/next.config');
  const config = configModule.default as { redirects?: () => Promise<Redirect[]> };
  if (!config.redirects) throw new Error('No redirects function found');
  return config.redirects();
}

/** Find a redirect rule by its exact source pattern */
function findRedirect(redirects: Redirect[], source: string): Redirect | undefined {
  return redirects.find((r) => r.source === source);
}

describe('next.config.ts redirects', () => {
  let redirects: Redirect[];

  beforeEach(async () => {
    redirects = await loadRedirects();
  });

  it('should return an array of redirects', () => {
    expect(Array.isArray(redirects)).toBe(true);
    expect(redirects.length).toBeGreaterThan(0);
  });

  it('all redirects should be permanent (301)', () => {
    for (const r of redirects) {
      expect(r.permanent).toBe(true);
    }
  });

  it('all redirects should have source and destination', () => {
    for (const r of redirects) {
      expect(r.source).toBeTruthy();
      expect(r.destination).toBeTruthy();
    }
  });

  describe('1. Root redirect', () => {
    it('root / is served as real HTML (no next.config.ts redirect — handled by middleware)', () => {
      // Since 7719f7c, the root serves real HTML via the App Router root page.
      // The / → /en redirect was removed from next.config.ts; locale routing
      // is handled by the proxy middleware instead.
      const r = findRedirect(redirects, '/');
      expect(r).toBeUndefined();
    });
  });

  describe('2. Double locale prefix', () => {
    it('should redirect /en/en/:path* to /en/:path*', () => {
      const r = findRedirect(redirects, '/en/en/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/:path*');
    });

    it('should redirect /zh/zh/:path* to /zh/:path*', () => {
      const r = findRedirect(redirects, '/zh/zh/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/zh/:path*');
    });
  });

  describe('3. Mixed locale prefix', () => {
    it('should redirect /zh/en/:path* to /zh/:path*', () => {
      const r = findRedirect(redirects, '/zh/en/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/zh/:path*');
    });

    it('should redirect /en/zh/:path* to /en/:path*', () => {
      const r = findRedirect(redirects, '/en/zh/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/:path*');
    });
  });

  describe('4. WP page renames', () => {
    it('should redirect /project/:slug (singular) to /projects/:slug', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/project/:slug');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/:slug/');
    });

    it('should redirect /have-a-project to /contact', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/have-a-project');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/contact/');
    });

    it('should redirect /features-benefits to /features', () => {
      // Updated 2026-04-08: Benefits page was renamed to Features (commit
      // 1d51206), so the old destination /benefits no longer exists. The
      // duplicate assertion in section 9e covers this same redirect with
      // the rename context — left here for the original WP-rename test path.
      const r = findRedirect(redirects, '/:locale(en|zh)/features-benefits');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/features/');
    });

    it('should redirect /vancouver-renovation-blog to /blog', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/vancouver-renovation-blog');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/blog/');
    });

    it('should redirect /renovation_article/:slug to /blog/:slug', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/renovation_article/:slug');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/blog/:slug/');
    });
  });

  describe('5. Old vancouver-renovation-projects paths', () => {
    it('should redirect kitchen sub-path', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/vancouver-renovation-projects/kitchen');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/kitchen/');
    });

    it('should redirect full-house to whole-house', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/vancouver-renovation-projects/full-house');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/whole-house/');
    });

    it('should redirect base path to projects hub', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/vancouver-renovation-projects');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/');
    });
  });

  describe('6. Category rename: full-house → whole-house', () => {
    it('should redirect projects/full-house to projects/whole-house', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/projects/full-house');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/whole-house/');
    });
  });

  describe('8. Old WP category paths', () => {
    it('should redirect /category/:path* to /projects', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/category/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/');
    });
  });

  describe('9. Old root-level project slugs (high impression GSC pages)', () => {
    it('should redirect Langley home reno to correct project', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/home-renovation-in-langley-kitchen-bathroom-basement');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/modern-kitchen-renovation-langley/');
    });

    it('should redirect Surrey home reno to correct project', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/surrey-home-renovation-kitchen-bathroom-stairs');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/surrey-whole-house-renovation/');
    });

    it('should redirect beauty clinic to commercial project', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/beauty-clinic-remodel-in-vancouver-commercial-project');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/projects/vancouver-skin-lab-commercial-renovation/');
    });
  });

  describe('9c. Old WP service page slugs', () => {
    // next.config.ts has trailingSlash: true — redirect destinations
    // include the trailing slash so the proxy doesn't double-redirect.
    it('should redirect /kitchen-renovation to /services/kitchen/', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/kitchen-renovation');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/services/kitchen/');
    });

    it('should redirect /bathroom-remodel to /services/bathroom/', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/bathroom-remodel');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/services/bathroom/');
    });

    it('should redirect /basement-renovation to /services/basement/', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/basement-renovation');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/services/basement/');
    });
  });

  describe('9d. Old about pages', () => {
    it('should redirect /about-us to about page', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/about-us');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/about/');
    });
  });

  describe('9e. Renamed pages — Benefits → Features, Process → Workflow', () => {
    // These guard against the indexing regression that happened when
    // benefits/page.tsx was renamed to features/page.tsx without updating
    // the legacy redirects: Google kept hitting /benefits, got 404, and
    // GSC's "Indexed pages" count dropped while "Not found (404)" rose.
    it('localized /benefits should redirect to /features/', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/benefits');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/features/');
    });

    it('legacy /features-benefits should redirect to /features/ (NOT /benefits)', () => {
      const r = findRedirect(redirects, '/:locale(en|zh)/features-benefits');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/:locale/features/');
    });

    it('non-localized /benefits should redirect to /en/features/', () => {
      const r = findRedirect(redirects, '/benefits');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/features/');
    });

    it('non-localized /process should redirect directly to /en/workflow/ (no double-hop)', () => {
      const r = findRedirect(redirects, '/process');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/workflow/');
    });
  });

  describe('10. Non-localized paths → default locale (EN)', () => {
    it('should redirect /projects/:path* to /en/projects/:path*', () => {
      const r = findRedirect(redirects, '/projects/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/projects/:path*');
    });

    it('should redirect /services/:path* to /en/services/:path*', () => {
      const r = findRedirect(redirects, '/services/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/services/:path*');
    });

    it('should redirect /contact to /en/contact/', () => {
      const r = findRedirect(redirects, '/contact');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/contact/');
    });

    it('should redirect /blog/:path* to /en/blog/:path*', () => {
      const r = findRedirect(redirects, '/blog/:path*');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/blog/:path*');
    });

    it('should redirect non-localized service page slugs directly', () => {
      const r = findRedirect(redirects, '/kitchen-renovation');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/services/kitchen/');
    });

    it('should redirect non-localized about-us', () => {
      const r = findRedirect(redirects, '/about-us');
      expect(r).toBeDefined();
      expect(r!.destination).toBe('/en/about/');
    });
  });

  describe('No redirect loops', () => {
    it('should not have any redirect where source equals destination', () => {
      for (const r of redirects) {
        expect(r.source).not.toBe(r.destination);
      }
    });
  });

  describe('No duplicate sources', () => {
    it('should not have duplicate source patterns', () => {
      const sources = redirects.map((r) => r.source);
      const uniqueSources = new Set(sources);
      expect(sources.length).toBe(uniqueSources.size);
    });
  });
});
