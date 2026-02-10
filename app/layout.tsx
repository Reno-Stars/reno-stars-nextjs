import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, getBaseUrl } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: `${SITE_NAME} - Where Renovation Starts`,
  description: "Professional renovation services in Vancouver and the Lower Mainland",
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
