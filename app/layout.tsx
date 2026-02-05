import type { Metadata } from "next";
import { headers } from 'next/headers';
import "./globals.css";
import { SITE_NAME } from '@/lib/utils';
import { images } from '@/lib/data';
import { ASSET_ORIGIN } from '@/lib/storage';
import { defaultLocale, type Locale } from '@/i18n/config';

export const metadata: Metadata = {
  title: `${SITE_NAME} - Where Renovation Starts`,
  description: "Professional renovation services in Vancouver and the Lower Mainland",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  // Read locale from x-locale header set by proxy, fallback to default
  const locale = (headersList.get('x-locale') as Locale) || defaultLocale;

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect for faster asset loading (implies dns-prefetch) */}
        <link rel="preconnect" href={ASSET_ORIGIN} crossOrigin="anonymous" />
        {/* Preload hero image for faster LCP */}
        <link rel="preload" as="image" href={images.hero} fetchPriority="high" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
