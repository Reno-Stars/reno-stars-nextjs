import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — controls the "Add to Home Screen" install flow on
 * mobile + the PWA-eligibility signal Lighthouse / Google uses for ranking
 * boost. Next.js auto-injects `<link rel="manifest" href="/manifest.webmanifest">`
 * across every rendered page when this file exists (app router convention).
 *
 * Asset references audited per §11.1.2 (NEVER reference an asset you haven't
 * verified exists). The icon URLs below were HEAD-checked 200 on
 * https://www.reno-stars.com 2026-05-30T02:30Z before this file was committed:
 *   - https://www.reno-stars.com/icon.png       → 200 (Next.js app/icon.png convention)
 *   - https://www.reno-stars.com/apple-icon.png → 200 (Next.js app/apple-icon.png convention)
 *
 * theme_color matches the NAVY (#1B365D) themeColor in app/layout.tsx's
 * Viewport export and the NAVY constant in lib/theme.ts — keeps the install
 * splash + status bar tint + URL bar tint consistent with the rest of the
 * brand chrome.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Reno Stars — Vancouver Renovation',
    short_name: 'Reno Stars',
    description:
      'Professional renovation services in Vancouver and the Lower Mainland — kitchen, bathroom, basement & whole-house. Licensed, insured, 3-year warranty.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#1B365D',
    background_color: '#FFFFFF',
    orientation: 'portrait-primary',
    categories: ['business', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
