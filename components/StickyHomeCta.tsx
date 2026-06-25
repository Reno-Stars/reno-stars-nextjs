'use client';

import { Phone, ArrowRight } from 'lucide-react';
import { GOLD, NAVY } from '@/lib/theme';

interface StickyHomeCtaProps {
  phone: string;
}

/**
 * Mobile-only sticky CTA bar for the homepage.
 * GA4 shows 0 conversions from 114 organic sessions despite 66.7% engagement
 * and 4m54s avg session duration — users read the page but don't convert.
 * A persistent bottom-bar gives mobile visitors a one-tap path to quote/call
 * without requiring a scroll back to the hero. Hidden on desktop (sm+) since
 * the layout already has prominent above-fold CTAs.
 *
 * Added: 2026-06-25 SEO tick-595 (GA4 high-engagement-no-convert finding)
 */
export default function StickyHomeCta({ phone }: StickyHomeCtaProps) {
  const phoneDigits = phone.replace(/[^\d+]/g, '');

  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2"
      style={{
        backgroundColor: 'rgba(232, 226, 218, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: `1px solid ${NAVY}1A`,
      }}
    >
      <div className="flex gap-2">
        <a
          href="#contact"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm shadow-md"
          style={{ backgroundColor: GOLD }}
          aria-label="Get a free renovation quote"
        >
          <span className="truncate">Free Renovation Quote</span>
          <ArrowRight size={16} />
        </a>
        <a
          href={`tel:${phoneDigits}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm"
          style={{ borderColor: NAVY, color: NAVY }}
          aria-label={`Call ${phone}`}
        >
          <Phone size={16} />
          <span>Call</span>
        </a>
      </div>
    </div>
  );
}
