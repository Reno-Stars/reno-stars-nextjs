'use client';

import { Award } from 'lucide-react';
import { GOLD, SURFACE_ALT, CARD, TEXT, neu } from '@/lib/theme';

interface TrustBadgesSectionProps {
  badges: string[];
}

export default function TrustBadgesSection({ badges }: TrustBadgesSectionProps) {
  return (
    <section aria-label="Trust badges" className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div key={badge} className="rounded-xl p-4 flex items-center gap-3" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
            <Award className="w-6 h-6 shrink-0" style={{ color: GOLD }} />
            <span className="text-base font-bold" style={{ color: TEXT }}>{badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
