import { NextResponse } from 'next/server';

/**
 * Apple App Site Association (AASA) — Universal Links.
 *
 * Served at /.well-known/apple-app-site-association with no extension.
 * Apple's swcd fetches this when the GeoClockr iOS app is installed and
 * caches it; tapping a matching URL from Mail / Messages opens the app
 * directly instead of Safari + the /signup fallback page.
 *
 * appIDs format: "<TEAM_ID>.<BUNDLE_ID>". Team 72C25NASFQ + bundle
 * com.geoclockr.app.mobile match the iOS production build registered
 * in App Store Connect.
 *
 * Components: only /signup?invite=<anything> is app-handled. Every other
 * page on this domain still loads in Safari as normal.
 *
 * Why a route handler and not a static file in /public:
 *   - Apple requires Content-Type: application/json (no charset).
 *     Next.js serves /public files with text/plain or based on extension;
 *     a static file at /public/.well-known/apple-app-site-association
 *     would 404 or serve as octet-stream depending on the host.
 *   - Vercel's edge config strips dotfile-prefixed directories from
 *     /public on some plans. A route handler is the reliable path.
 */

const AASA = {
  applinks: {
    details: [
      {
        appIDs: ['72C25NASFQ.com.geoclockr.app.mobile'],
        components: [
          {
            '/': '/signup',
            '?': { invite: '*' },
            comment: 'Invite accept links',
          },
        ],
      },
    ],
  },
};

export function GET() {
  return NextResponse.json(AASA, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const dynamic = 'force-static';
