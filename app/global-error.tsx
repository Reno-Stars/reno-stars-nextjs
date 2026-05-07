'use client';

/**
 * Last-resort error boundary that catches throws from the root layout
 * (`app/layout.tsx`) and from `app/[locale]/layout.tsx` when a downstream
 * provider — `getMessages()`, `getCompanyFromDb()`, etc. — fails before
 * `app/[locale]/error.tsx` is mounted.
 *
 * Without this file, an uncaught error above the locale boundary falls
 * through to Next's bare default 500 page (no styles, no branding) and
 * Googlebot logs a clean 5xx. With this file we still serve HTTP 500
 * (Next sets that automatically because `error.tsx` files render an
 * error response), but the body has navigation back to a working
 * page so a real user lands somewhere recoverable.
 *
 * Background:
 *   - 2026-05 GSC reported 36 server errors. Root causes traced and
 *     fixed (commits c0a549d blog-date TypeError, 5d67e36/a65a538
 *     Next 16 prerender-shell regression). This file is a belt-and-
 *     braces backstop so the next analogous regression doesn't
 *     surface as a blank Next default 500 to crawlers.
 *
 * Constraints:
 *   - Must define <html> and <body> (Next docs requirement).
 *   - Cannot use next-intl, getTranslations, or any DB call — those
 *     are the things most likely to be throwing in the first place.
 *   - Plain inline styles only; no Tailwind classes (this file ships
 *     in the runtime even when the rest of the build is broken).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Forward to console so it shows up in Vercel runtime logs even
  // before any analytics provider has loaded.
  if (typeof window !== 'undefined') {
    console.error('[global-error]', error?.message, 'digest=', error?.digest);
  }

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E8E2DA',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#1B365D',
          padding: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#EDE8E1',
            borderRadius: '1rem',
            boxShadow:
              '8px 8px 24px rgba(196,187,176,0.6), -8px -8px 24px rgba(250,245,238,0.9)',
            padding: '3rem 2rem',
            maxWidth: '32rem',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginTop: 0,
              marginBottom: '0.75rem',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              opacity: 0.7,
              marginBottom: '1.75rem',
              lineHeight: 1.5,
            }}
          >
            We hit an unexpected error. Please try again, or head back to the
            home page.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: '#C8922A',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error: router may be broken */}
            <a
              href="/en/"
              style={{
                color: '#1B365D',
                border: '2px solid #1B365D',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Back to Reno Stars
            </a>
          </div>
          {error?.digest && (
            <p
              style={{
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                opacity: 0.5,
                fontFamily: 'monospace',
              }}
            >
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
