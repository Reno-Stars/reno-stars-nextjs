'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import {
  GOLD, GOLD_PALE, SURFACE, CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';
import { trackMetaEvent } from '@/components/MetaPixel';

interface ThankYouPageProps {
  locale: Locale;
}

export default function ThankYouPage({ locale: _locale }: ThankYouPageProps) {
  const t = useTranslations();

  // Fire Meta Pixel Lead event on thank-you page
  useEffect(() => {
    trackMetaEvent('Lead', { value: 100, currency: 'CAD' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: SURFACE }}>
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{ boxShadow: neu(6), backgroundColor: CARD }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: GOLD_PALE }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: GOLD }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
              {t('contact.thankYouTitle')}
            </h1>
            <p className="text-base mb-8" style={{ color: TEXT_MID }}>
              {t('contact.thankYouMessage')}
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
            >
              {t('contact.returnHome')}
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
