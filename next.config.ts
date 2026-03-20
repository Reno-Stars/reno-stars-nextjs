import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Parse storage URL for image optimization config
const storageUrl = process.env.NEXT_PUBLIC_STORAGE_PROVIDER;
const storagePatterns: { protocol: 'http' | 'https'; hostname: string; port?: string; pathname: string }[] = [];
let allowLocalIP = false;

if (storageUrl) {
  try {
    const u = new URL(storageUrl);
    allowLocalIP = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const basePath = u.pathname === '/' ? '' : u.pathname;
    storagePatterns.push({
      protocol: u.protocol.replace(':', '') as 'http' | 'https',
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: `${basePath}/**`,
    });
  } catch {
    // Invalid URL — skip
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Optimize imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  images: {
    dangerouslyAllowLocalIP: allowLocalIP,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'reno-stars.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      // Cloudflare R2 public buckets for production assets
      {
        protocol: 'https',
        hostname: 'pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev',
        pathname: '/**',
      },
      // Old R2 bucket (retained during migration until all DB URLs are rewritten)
      {
        protocol: 'https',
        hostname: 'pub-c1ab6c279d0b4d818f91cee00ab3defe.r2.dev',
        pathname: '/**',
      },
      ...storagePatterns,
    ],
  },
  async redirects() {
    return [
      // ================================================================
      // 1. Root redirect
      // ================================================================
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },

      // ================================================================
      // 2. Double locale prefix — strip inner duplicate
      //    /en/en/projects/ → /en/projects/
      //    /zh/zh/projects/ → /zh/projects/
      // ================================================================
      {
        source: '/en/en/:path*',
        destination: '/en/:path*',
        permanent: true,
      },
      {
        source: '/zh/zh/:path*',
        destination: '/zh/:path*',
        permanent: true,
      },

      // ================================================================
      // 3. Mixed locale prefix — keep outer locale, strip inner
      //    /zh/en/projects/ → /zh/projects/  (user was on ZH site)
      //    /en/zh/projects/ → /en/projects/  (user was on EN site)
      //    Per SEO guide §1.1 and §1.3
      // ================================================================
      {
        source: '/zh/en/:path*',
        destination: '/zh/:path*',
        permanent: true,
      },
      {
        source: '/en/zh/:path*',
        destination: '/en/:path*',
        permanent: true,
      },

      // ================================================================
      // 4. Old WP page renames
      // ================================================================
      // --- WP project CPT slugs (long WP slugs don't exist in new DB) ---
      {
        source: '/:locale(en|zh)/project/whole-house-renovation-modern-luxury-kitchen-and-bathroom-renovation',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/modernizing-the-core-of-the-home-kitchen-bath-living-space',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/richmond-whole-house-renovation-from-kitchen-to-bedroom',
        destination: '/:locale/projects/richmond-kitchen-bathroom-remodel',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/small-budget-modern-kitchen-makeover',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/affordable-modern-remodel-from-outdated-to-fresh-in-kitchen-bathroom-living-room',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/stunning-beauty-clinic-remodel-in-vancouver-a-full-commercial-renovation-transformation',
        destination: '/:locale/projects/commercial-renovation-skin-lab-granville',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/richmond-townhouse-makeover-kitchen-bathroom-laundry-room',
        destination: '/:locale/projects/richmond-kitchen-bathroom-remodel',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/vancouver-whole-house-renovation-full-home-remodel-and-interior-upgrade',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/customized-kitchen-and-bathroom-cabinet-refacing-in-coquitlam',
        destination: '/:locale/projects/coquitlam-white-shaker-cabinets',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/project/luxury-kitchen-remodel-bathroom-renovation-in-richmond-bc-reno-stars',
        destination: '/:locale/projects/richmond-kitchen-remodel-bath',
        permanent: true,
      },
      // /project/ (singular CPT) → /projects/
      {
        source: '/:locale(en|zh)/project/:slug',
        destination: '/:locale/projects/:slug',
        permanent: true,
      },
      // /have-a-project → /contact
      {
        source: '/:locale(en|zh)/have-a-project',
        destination: '/:locale/contact',
        permanent: true,
      },
      // /features-benefits → /benefits
      {
        source: '/:locale(en|zh)/features-benefits',
        destination: '/:locale/benefits',
        permanent: true,
      },
      // /vancouver-renovation-blog → /blog
      {
        source: '/:locale(en|zh)/vancouver-renovation-blog',
        destination: '/:locale/blog',
        permanent: true,
      },
      // Unicode comma blog slug → clean slug
      {
        source: '/:locale(en|zh)/renovation_article/the-story-of-reno-stars\uFF0C-vancouver-local-renovation-company',
        destination: '/:locale/blog/the-story-of-reno-stars-vancouver-local-renovation-company',
        permanent: true,
      },
      // /renovation_article/:slug → /blog/:slug
      {
        source: '/:locale(en|zh)/renovation_article/:slug',
        destination: '/:locale/blog/:slug',
        permanent: true,
      },

      // ================================================================
      // 5. Old vancouver-renovation-projects paths
      //    These existed at /en/en/vancouver-renovation-projects/* and
      //    after double-prefix strip become /en/vancouver-renovation-projects/*
      // ================================================================
      {
        source: '/:locale(en|zh)/vancouver-renovation-projects/kitchen',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/vancouver-renovation-projects/bathroom',
        destination: '/:locale/projects/bathroom',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/vancouver-renovation-projects/full-house',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/vancouver-renovation-projects/commercial',
        destination: '/:locale/projects/commercial',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/vancouver-renovation-projects/home-installation',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/vancouver-renovation-projects',
        destination: '/:locale/projects',
        permanent: true,
      },

      // ================================================================
      // 6. full-house → whole-house (category rename)
      // ================================================================
      {
        source: '/:locale(en|zh)/projects/full-house',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },

      // ================================================================
      // 7. home-installation → projects hub
      // ================================================================
      {
        source: '/:locale(en|zh)/projects/home-installation',
        destination: '/:locale/projects',
        permanent: true,
      },

      // ================================================================
      // 8. Old WP category paths → projects hub
      // ================================================================
      {
        source: '/:locale(en|zh)/category/:path*',
        destination: '/:locale/projects',
        permanent: true,
      },

      // ================================================================
      // 9. Old root-level project slugs → new project detail pages
      //    These are high-impression pages per GSC data (Appendix A)
      //    Mapped to closest matching new project slug
      // ================================================================

      // Richmond kitchen + bathroom (6,380 imp) → richmond-kitchen-remodel-bath
      {
        source: '/:locale(en|zh)/richmond-kitchen-remodel-bathroom-renovation-project',
        destination: '/:locale/projects/richmond-kitchen-remodel-bath',
        permanent: true,
      },
      // Delta kitchen + bathroom (6,848 imp) → kitchen-renovation-delta
      {
        source: '/:locale(en|zh)/kitchen-and-bathroom-renovation-in-delta-bc',
        destination: '/:locale/projects/kitchen-renovation-delta',
        permanent: true,
      },
      // Langley home reno (18,477 imp) → stunning-home-renovation-langley
      {
        source: '/:locale(en|zh)/home-renovation-in-langley-kitchen-bathroom-basement',
        destination: '/:locale/projects/stunning-home-renovation-langley',
        permanent: true,
      },
      // Surrey home reno (7,971 imp) → surrey-home-renovation
      {
        source: '/:locale(en|zh)/surrey-home-renovation-kitchen-bathroom-stairs',
        destination: '/:locale/projects/surrey-home-renovation',
        permanent: true,
      },
      // West Vancouver bathroom vanity → bathroom-vanity-west-vancouver
      {
        source: '/:locale(en|zh)/west-vancouver-renovation-floating-bathroom-vanity',
        destination: '/:locale/projects/bathroom-vanity-west-vancouver',
        permanent: true,
      },
      // Coquitlam cabinet refacing → coquitlam-white-shaker-cabinets
      {
        source: '/:locale(en|zh)/kitchen-bathroom-cabinet-refacing-in-coquitlam',
        destination: '/:locale/projects/coquitlam-white-shaker-cabinets',
        permanent: true,
      },
      // Coquitlam white shaker (long slug) → coquitlam-white-shaker-cabinets
      {
        source: '/:locale(en|zh)/elegant-white-shaker-kitchens-in-coquitlam-elevate-your-home-with-timeless-design',
        destination: '/:locale/projects/coquitlam-white-shaker-cabinets',
        permanent: true,
      },
      // Modern kitchen Richmond → modern-kitchen-richmond
      {
        source: '/:locale(en|zh)/modern-renovation-at-kitchen-and-bathroom-richmond',
        destination: '/:locale/projects/modern-kitchen-richmond',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/modern-kitchen-renovation-in-richmond-bc-full-house',
        destination: '/:locale/projects/modern-kitchen-richmond',
        permanent: true,
      },
      // Richmond full house → richmond-kitchen-bathroom-remodel
      {
        source: '/:locale(en|zh)/full-house-renovation-in-richmond-bc-kitchen-bath',
        destination: '/:locale/projects/richmond-kitchen-bathroom-remodel',
        permanent: true,
      },
      // Beauty clinic commercial → commercial-renovation-skin-lab-granville
      {
        source: '/:locale(en|zh)/beauty-clinic-remodel-in-vancouver-commercial-project',
        destination: '/:locale/projects/commercial-renovation-skin-lab-granville',
        permanent: true,
      },
      // Surrey before/after → surrey-home-before-after
      {
        source: '/:locale(en|zh)/kitchen-renovation-in-surrey-renovation-project',
        destination: '/:locale/projects/surrey-home-before-after',
        permanent: true,
      },
      // White Rock kitchen → projects/kitchen (no exact match)
      {
        source: '/:locale(en|zh)/kitchen-renovation-in-white-rock-countertop',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },

      // --- Remaining old slugs → best matching category hub ---

      // Burnaby kitchen → kitchen category
      {
        source: '/:locale(en|zh)/burnaby-kitchen-renovation',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },
      // Vancouver whole house → whole-house category
      {
        source: '/:locale(en|zh)/vancouver-whole-house-renovation',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/whole-house-renovation-from-kitchen',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/renovated-whole-house-richmond',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/richmond-townhouse-whole-house',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      // Coquitlam bathroom → bathroom category
      {
        source: '/:locale(en|zh)/coquitlam-bathroom-renovation',
        destination: '/:locale/projects/bathroom',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/stunning-bathroom-renovation',
        destination: '/:locale/projects/bathroom',
        permanent: true,
      },
      // Condo projects → projects hub
      {
        source: '/:locale(en|zh)/vancouver-downtown-condo',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/condo-renovation-in-coquitlam-kitchen-bathroom-black',
        destination: '/:locale/projects',
        permanent: true,
      },
      // Coquitlam home reno → projects hub
      {
        source: '/:locale(en|zh)/home-renovation-in-coquitlam-kitchen-bedroom-cabinet',
        destination: '/:locale/projects',
        permanent: true,
      },
      // Maple Ridge → projects hub ("somplete" is the original WP typo, not a bug)
      {
        source: '/:locale(en|zh)/maple-ridge-project-somplete',
        destination: '/:locale/projects',
        permanent: true,
      },
      // Commercial projects → commercial category
      {
        source: '/:locale(en|zh)/commercial-renovation-in-langley-cabinets-kitchen',
        destination: '/:locale/projects/commercial',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/commercial-pokin',
        destination: '/:locale/projects/commercial',
        permanent: true,
      },

      // ================================================================
      // 9b. Additional old root-level post slugs from WP sitemap
      // ================================================================
      {
        source: '/:locale(en|zh)/kitchen-renovation-section',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/home-renovation-in-richmond-kitchen-and-livingroom',
        destination: '/:locale/projects/richmond-kitchen-bathroom-remodel',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/modern-bathroom-renovation-in-vancouver',
        destination: '/:locale/projects/bathroom',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/washroom-renovation-in-surrey-modern-walkin-shower',
        destination: '/:locale/projects/bathroom',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/condo-renovation-in-surrey-kitchen-bathroom',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/whole-house-renovation-from-kitchen-to-bathroom',
        destination: '/:locale/projects/whole-house',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/commercial-emergency-renovation-rescue',
        destination: '/:locale/blog/emergency-renovation-rescue',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/commercial-wall-opening-project',
        destination: '/:locale/projects/commercial',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/downtown-duplex-apartment-electrical-fireplace-copy',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/kitchen-remodel-in-vancouver',
        destination: '/:locale/projects/kitchen',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/budget-friendly-reno',
        destination: '/:locale/projects',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/coquitlam-white-shaker-cabinets',
        destination: '/:locale/projects/coquitlam-white-shaker-cabinets',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/richmond-kitchen-and-bathroom-remodel',
        destination: '/:locale/projects/richmond-kitchen-bathroom-remodel',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/kitchen-renovation-in-surrey-white-toned-kitchen',
        destination: '/:locale/projects/white-toned-kitchen-surrey',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/kitchen-renovation-in-delta-bc',
        destination: '/:locale/projects/kitchen-renovation-delta',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/comprehensive-modern-kitchen-renovation-in-richmond',
        destination: '/:locale/projects/modern-kitchen-richmond',
        permanent: true,
      },
      {
        source: '/:locale(en|zh)/a-stunning-bathroom-renovation',
        destination: '/:locale/projects/bathroom',
        permanent: true,
      },

      // ================================================================
      // 10. Non-localized paths → default locale (EN)
      // ================================================================
      {
        source: '/projects/:path*',
        destination: '/en/projects/:path*',
        permanent: true,
      },
      {
        source: '/services/:path*',
        destination: '/en/services/:path*',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/en/blog/:path*',
        permanent: true,
      },
      {
        source: '/design',
        destination: '/en/design',
        permanent: true,
      },
      {
        source: '/benefits',
        destination: '/en/benefits',
        permanent: true,
      },
      {
        source: '/process',
        destination: '/en/process',
        permanent: true,
      },
      {
        source: '/areas/:path*',
        destination: '/en/areas/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Proxy legacy WordPress upload paths to R2 storage.
    // Safety net for direct requests to /wp-content/uploads/* after domain migration.
    const storage = process.env.NEXT_PUBLIC_STORAGE_PROVIDER;
    if (!storage) return [];
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: `${storage.replace(/\/+$/, '')}/uploads/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
