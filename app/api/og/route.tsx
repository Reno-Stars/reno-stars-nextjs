import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
// Brand palette SSOT — same NAVY/GOLD/SURFACE the site UI uses.
import { NAVY, GOLD, SURFACE } from '@/lib/theme';

export const runtime = 'edge';

const FONT_BOLD_URL =
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.1/latin-700-normal.ttf';
const FONT_REGULAR_URL =
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.1.1/latin-400-normal.ttf';

// Cache the SUCCESSFUL font bytes only. A module-level `fetch().then()` promise
// caches its REJECTION forever — one CDN blip at process boot would degrade
// every OG image for the process lifetime. This memo re-fetches after a failure.
let fontCache: Promise<[ArrayBuffer, ArrayBuffer]> | null = null;
function loadFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  if (fontCache) return fontCache;
  const p = Promise.all([
    fetch(FONT_BOLD_URL).then((res) => res.arrayBuffer()),
    fetch(FONT_REGULAR_URL).then((res) => res.arrayBuffer()),
  ]) as Promise<[ArrayBuffer, ArrayBuffer]>;
  fontCache = p;
  p.catch(() => { if (fontCache === p) fontCache = null; }); // drop failed memo → retry next request
  return p;
}

export async function GET(request: NextRequest) {
  let boldFont: ArrayBuffer;
  let regularFont: ArrayBuffer;
  try {
    [boldFont, regularFont] = await loadFonts();
  } catch {
    // Font CDN unavailable — return a minimal OG image without custom fonts
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: NAVY, color: 'white', fontSize: 48 }}>
          Reno Stars
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const { searchParams } = request.nextUrl;

  const title = (searchParams.get('title') || 'Reno Stars').slice(0, 100);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 150);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: NAVY,
          padding: '60px 80px',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        {/* Gold accent bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: GOLD,
            display: 'flex',
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: GOLD,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'white',
              fontWeight: 700,
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: GOLD,
              letterSpacing: '3px',
              textTransform: 'uppercase' as const,
            }}
          >
            Reno Stars
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? 48 : 56,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: SURFACE,
                lineHeight: 1.4,
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              height: '3px',
              width: '60px',
              backgroundColor: GOLD,
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: SURFACE,
              opacity: 0.8,
            }}
          >
            Vancouver Renovation Contractor
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: boldFont, style: 'normal', weight: 700 },
        { name: 'Inter', data: regularFont, style: 'normal', weight: 400 },
      ],
      // Maximum aggressive edge caching — OG images for a given (title, subtitle)
      // tuple never change, so we can serve them from CDN forever after the
      // first generation. Explicit headers beat Next.js defaults for clarity.
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    }
  );
}
