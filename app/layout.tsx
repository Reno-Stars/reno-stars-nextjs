import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, getBaseUrl } from '@/lib/utils';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: `${SITE_NAME} - Where Renovation Starts`,
  description: "Professional renovation services in Vancouver and the Lower Mainland",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@renostars',
    creator: '@renostars',
  },
};

/**
 * Root layout - minimal wrapper that delegates to locale layout.
 * The <html> and <body> tags are rendered in app/[locale]/layout.tsx
 * where we have access to the locale from URL params.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
