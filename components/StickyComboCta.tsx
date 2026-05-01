'use client';

import { useTranslations } from 'next-intl';
import { Phone, ArrowRight } from 'lucide-react';
import { GOLD, NAVY } from '@/lib/theme';

interface StickyComboCtaProps {
  area: string;
  service: string;
  phone: string;
}

/**
 * Mobile-only sticky CTA bar for /services/{svc}/{city}/ pages. Combo
 * pages have meaningful impressions but low CTR; a persistent bottom-bar
 * gives mobile users a one-tap "Get quote" + "Call" path that doesn't
 * require scrolling back to the hero.
 *
 * Hidden on desktop (sm+) since the layout already has prominent CTAs.
 */
export default function StickyComboCta({ area, service, phone }: StickyComboCtaProps) {
  const t = useTranslations('cta');
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
          aria-label={t('stickyQuoteFor', { area, service })}
        >
          <span className="truncate">{t('stickyQuoteFor', { area, service })}</span>
          <ArrowRight size={16} />
        </a>
        <a
          href={`tel:${phoneDigits}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm"
          style={{ borderColor: NAVY, color: NAVY }}
          aria-label={`${t('stickyCall')} ${phone}`}
        >
          <Phone size={16} />
          <span>{t('stickyCall')}</span>
        </a>
      </div>
    </div>
  );
}
