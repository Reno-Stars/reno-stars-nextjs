import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, getBaseUrl } from '@/lib/utils';
import { getYearsExperience } from '@/lib/company-config';

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

// generateMetadata (not a const) so getYearsExperience() re-evaluates at
// render time instead of freezing at process boot.
export function generateMetadata(): Metadata {
  return {
  metadataBase: new URL(getBaseUrl()),
  // Root layout title + description are FALLBACKs — used on routes that
  // don't override metadata (404 page via app/not-found.tsx inherits the
  // description; global error page; the bare /page.tsx redirect surface).
  // Per-locale routes under app/[locale]/ override with richer
  // generateMetadata() pulling from messages/<locale>/metadata.json.
  //
  // Pre-2026-05-30 the fallback was a generic 12-word filler. Now it
  // mirrors the structure of metadata.home (Trusted-Vancouver hook +
  // quantified credibility signals + service breadth + CTA) using
  // config-derived numbers (lib/company-config.ts, no runtime data
  // access). Boosts the 404 page's SERP description and any future
  // route that forgets to define its own metadata.
  title: `${SITE_NAME} — Vancouver Renovation | Kitchen, Bath & Whole-House`,
  description: `Trusted Vancouver renovation & remodeling contractor — ${getYearsExperience()}+ yrs, 700+ projects, 5★ Google, $5M insured, 3-yr warranty. Kitchen, bathroom & whole-house renovations across Metro Vancouver. Free quote 24h.`,
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
  // Root-level OpenGraph fallback — used by 404 page (inherits) and any
  // other route without an explicit OG override. Per-locale routes set
  // their own richer OG in generateMetadata. Setting siteName + locale +
  // type at root means accidentally-followed dead links share with a
  // recognisable preview instead of an empty/default one.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  // appleWebApp pairs with the PWA manifest (app/manifest.ts) to enable
  // a proper "Add to Home Screen" experience on iOS. capable:true tells
  // Safari the site can run as a standalone app; title is what shows
  // under the home-screen icon; default status-bar style matches the
  // light NAVY-themed chrome (vs black-translucent which suits dark UIs).
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
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
}

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
