import type { Metadata } from 'next';

/**
 * GeoClockr invite landing.
 *
 * The mobile app (https://github.com/Reno-Stars/geo-clockr)'s
 * `send-invite` edge function generates accept URLs like
 * `https://www.reno-stars.com/signup?invite=<token>`. Once iOS
 * Universal Links are wired (AASA file at /.well-known/apple-app-
 * site-association declares this path as app-handled), tapping the
 * link from Mail / Messages on a device with the GeoClockr app
 * installed opens the app directly — never reaching this page.
 *
 * This page is the FALLBACK for users without the app: shows them
 * App Store + Play Store buttons, plus the raw invite token they
 * can paste into the app's "Join with Invite" tab if both store
 * links fail.
 *
 * Intentionally outside `[locale]/` because:
 *   - It's a deep-link landing, not an SEO surface — no need for
 *     /en/ /zh/ /ja/ variants. The token is opaque; the page is
 *     transient.
 *   - The send-invite edge function generates `/signup?invite=X`
 *     without a locale segment. Adding locale routing here would
 *     either require the edge function to know the recipient's
 *     locale (it doesn't) or a redirect from /signup → /en/signup
 *     that loses the search params on some Next.js + Vercel
 *     edge cases.
 */

export const metadata: Metadata = {
  title: 'Welcome to GeoClockr',
  description: 'Accept your invitation to join GeoClockr.',
  robots: { index: false, follow: false },
};

interface PageProps {
  // Next.js 15 — searchParams is a Promise.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const APP_STORE_URL = 'https://apps.apple.com/app/geoclockr/id6740000000'; // TODO: replace with real App Store ID once published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.geoclockr.mobile';

export default async function InviteLandingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawToken = params.invite;
  const token = typeof rawToken === 'string' ? rawToken : '';

  // Defensive: token shape is hex-encoded by gen_random_bytes(32) →
  // 64 chars of [0-9a-f]. Anything else is either malformed or a
  // probe; render a generic page without exposing the bad value.
  const looksValid = /^[0-9a-f]{64}$/i.test(token);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #312e81 100%)',
        color: '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          Welcome to GeoClockr
        </h1>
        <p style={{ fontSize: 16, color: '#c7d2fe', marginBottom: 32, lineHeight: 1.5 }}>
          {looksValid
            ? "You've been invited to join a GeoClockr team. Open the app to accept."
            : 'This invite link looks invalid. Ask whoever invited you to send a fresh one.'}
        </p>

        {looksValid && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <a
                href={APP_STORE_URL}
                style={{
                  background: '#fff',
                  color: '#1a1a2e',
                  padding: '14px 24px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                Get GeoClockr on the App Store
              </a>
              <a
                href={PLAY_STORE_URL}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  padding: '14px 24px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  border: '1px solid #818cf8',
                }}
              >
                Get on Google Play
              </a>
            </div>

            <details style={{ textAlign: 'left', marginTop: 24 }}>
              <summary
                style={{
                  cursor: 'pointer',
                  color: '#a5b4c8',
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Already have the app? Show invite token
              </summary>
              <p style={{ fontSize: 13, color: '#c7d2fe', marginTop: 12, marginBottom: 8 }}>
                Open the app, go to <strong>Onboarding → Join with Invite</strong>, and paste this
                token:
              </p>
              <code
                style={{
                  display: 'block',
                  background: '#0d0d1a',
                  padding: '12px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  wordBreak: 'break-all',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  color: '#a5b4c8',
                  border: '1px solid #2e2e4e',
                }}
              >
                {token}
              </code>
            </details>
          </>
        )}

        <p style={{ marginTop: 48, fontSize: 12, color: '#6b7280' }}>
          Reno Stars — Vancouver renovation company
        </p>
      </div>
    </main>
  );
}
