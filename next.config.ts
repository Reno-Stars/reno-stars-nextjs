import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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
        source: '/areas/:path*',
        destination: '/en/areas/:path*',
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
