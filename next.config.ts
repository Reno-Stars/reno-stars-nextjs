import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'reno-stars.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect root to default locale
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      // Strip double locale prefix
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
      // Old URL redirects
      {
        source: '/en/project/:slug',
        destination: '/en/projects/:slug',
        permanent: true,
      },
      {
        source: '/zh/project/:slug',
        destination: '/zh/projects/:slug',
        permanent: true,
      },
      {
        source: '/en/have-a-project',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/zh/have-a-project',
        destination: '/zh/contact',
        permanent: true,
      },
      {
        source: '/en/features-benefits',
        destination: '/en/benefits',
        permanent: true,
      },
      {
        source: '/zh/features-benefits',
        destination: '/zh/benefits',
        permanent: true,
      },
      {
        source: '/en/vancouver-renovation-blog',
        destination: '/en/blog',
        permanent: true,
      },
      {
        source: '/zh/vancouver-renovation-blog',
        destination: '/zh/blog',
        permanent: true,
      },
      {
        source: '/en/renovation_article/:slug',
        destination: '/en/blog/:slug',
        permanent: true,
      },
      {
        source: '/zh/renovation_article/:slug',
        destination: '/zh/blog/:slug',
        permanent: true,
      },
      // Non-localized to localized redirects
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
    ];
  },
};

export default withNextIntl(nextConfig);
