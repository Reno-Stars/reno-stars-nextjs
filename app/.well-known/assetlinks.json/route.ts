import { NextResponse } from 'next/server';

/**
 * Digital Asset Links — Android App Links verification.
 *
 * Served at /.well-known/assetlinks.json. Android's verifier fetches this
 * when the GeoClockr app declares an autoVerify intent filter for
 * www.reno-stars.com/signup (app.json → android.intentFilters). When the
 * package + a signing fingerprint here match the installed app, tapping a
 * matching link from Gmail / a browser opens the app directly instead of
 * loading the Safari/Chrome /signup fallback page.
 *
 * The three fingerprints are the package's registered SHA-256 signing
 * certs from Play Console → App integrity (upload key, Play App Signing
 * key, and the verification key). Including all three covers every install
 * path — Play-distributed (re-signed by Google) and direct/EAS APKs alike.
 * All were "已验证 / verified" in the console on 2026-05-29.
 *
 * Pairs with the iOS AASA (./apple-app-site-association) and the mobile
 * intentFilters. Why a route handler (not /public): Android requires
 * Content-Type: application/json, which Next.js doesn't reliably set for
 * a dotfile-prefixed static file — same reasoning as the AASA route.
 */

const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.geoclockr.mobile',
      sha256_cert_fingerprints: [
        '44:11:86:BC:B9:B7:B2:A5:F0:23:D1:B3:63:80:85:B5:68:B4:51:26:89:05:47:DF:3A:2C:12:CB:CC:AB:BD:8A',
        'BE:2B:24:73:A5:3E:34:59:93:41:20:6D:9F:7A:25:C4:1F:F3:6C:5F:58:E2:73:AE:12:2F:55:13:4B:4A:5E:52',
        'A0:8A:C4:69:EC:E3:6D:A0:38:F5:66:78:01:FD:16:E3:72:21:35:DC:C5:24:C4:B6:D6:49:D0:39:5F:C5:AF:5A',
      ],
    },
  },
];

export function GET() {
  return NextResponse.json(ASSET_LINKS, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const dynamic = 'force-static';
