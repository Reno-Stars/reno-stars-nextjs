import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, getBaseUrl } from '@/lib/utils';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // themeColor populates <meta name="theme-color"> — controls the mobile
  // browser tab/UI chrome (URL bar background on iOS Safari, status bar tint
  // on Android Chrome) so the site frame matches the brand instead of
  // defaulting to the OS gray. Value mirrors NAVY in lib/theme.ts (#1B365D),
  // which is the same color the footer + hero NAVY accent + sticky CTA bar
  // already use. Also doubles as a PWA / add-to-home-screen color when the
  // site is installed.
  themeColor: '#1B365D',
  // colorScheme populates <meta name="color-scheme" content="light">. The
  // site has no dark-mode (no `dark:` Tailwind variants, no
  // `prefers-color-scheme` CSS, no toggle UI). Declaring 'light' tells the
  // browser to render native UI chrome (form controls, scrollbars, default
  // text fields) in light variants instead of attempting OS-level dark
  // adaptation that produces inverted controls inside a light page.
  colorScheme: 'light',
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: `${SITE_NAME} - Where Renovation Starts`,
  description: "Professional renovation services in Vancouver and the Lower Mainland",
  authors: [{ name: 'Reno Stars' }],
  // formatDetection: telephone:true makes iOS Safari auto-link any phone
  // number in body text into a tap-to-call link. The contractor business
  // wants this — most users discover the phone number in the footer or
  // service-area body copy. Default iOS behavior also does this, but
  // declaring it explicitly clarifies intent and stops some accessibility
  // tools from overriding. date/address/email left undefined (defaults
  // are conservative; we don't want every iso-date string in a project
  // description auto-linked into the Calendar app).
  formatDetection: {
    telephone: true,
  },
  verification: {
    google: 'FuaUhlygBAgGgvbRm4saQDfrnX9EBkdo98ZSQU3B4Oo',
  },
  other: {
    'p:domain_verify': 'aba89ace071fac8fe04f3fd8d6e83160',
  },
  // icons auto-detected from app/icon.png and app/apple-icon.png (file convention)
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
